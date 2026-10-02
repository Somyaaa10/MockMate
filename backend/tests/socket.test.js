const http = require("http");
const { Server } = require("socket.io");
const { io: ioClient } = require("socket.io-client");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user.model");
const PeerInterview = require("../models/peerInterview.model");
const registerPeerInterviewSocket = require("../sockets/peerInterview.socket");
const registerAIInterviewSocket = require("../sockets/aiInterview.socket");
const { generateAccessToken } = require("../utils/generateToken");

describe("WebRTC & Socket.IO Automated Integration Tests", () => {
  let server;
  let ioServer;
  let serverAddress;
  let user1;
  let user2;
  let user3;
  let token1;
  let token2;
  let token3;
  let activeClients = [];

  const createClientSocket = (authToken, options = {}) => {
    return new Promise((resolve, reject) => {
      const authObj = authToken !== undefined ? { token: authToken } : {};
      const client = ioClient(serverAddress, {
        auth: authObj,
        transports: ["websocket"],
        forceNew: true,
        reconnection: false,
        ...options,
      });

      client.on("connect", () => {
        activeClients.push(client);
        resolve(client);
      });

      client.on("connect_error", (err) => {
        activeClients.push(client);
        reject(err);
      });
    });
  };

  beforeAll((done) => {
    server = http.createServer(app);
    ioServer = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Replicate production Socket.IO auth middleware from server.js
    ioServer.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error("Authentication token required"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Invalid socket authentication"));
      }
    });

    // Production socket connection handler
    ioServer.on("connection", (socket) => {
      if (socket.userId) {
        const userRoom = `user:${socket.userId.toString()}`;
        socket.join(userRoom);
      }
      registerPeerInterviewSocket(ioServer, socket);
      registerAIInterviewSocket(ioServer, socket);
    });

    server.listen(0, () => {
      const port = server.address().port;
      serverAddress = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    activeClients.forEach((client) => {
      if (client.connected) client.disconnect();
    });
    activeClients = [];
    ioServer.close(() => {
      done();
    });
  });

  beforeEach(async () => {
    user1 = await User.create({
      fullName: "Socket Host User",
      email: "sockethost@example.com",
      password: "Password123!",
    });
    user2 = await User.create({
      fullName: "Socket Peer User",
      email: "socketpeer@example.com",
      password: "Password123!",
    });
    user3 = await User.create({
      fullName: "Socket Unauthorized User",
      email: "socketunauth@example.com",
      password: "Password123!",
    });

    token1 = generateAccessToken(user1._id);
    token2 = generateAccessToken(user2._id);
    token3 = generateAccessToken(user3._id);
  });

  afterEach(() => {
    activeClients.forEach((client) => {
      if (client.connected) client.disconnect();
    });
    activeClients = [];
  });

  // ==================================================
  // STEP 3: SOCKET AUTHENTICATION
  // ==================================================
  describe("Socket Authentication", () => {
    it("1. valid authenticated connection succeeds", async () => {
      const client = await createClientSocket(token1);
      expect(client.connected).toBe(true);
    });

    it("2. missing authentication is rejected", async () => {
      await expect(createClientSocket(undefined)).rejects.toThrow(
        "Authentication token required"
      );
    });

    it("3. invalid or expired authentication is rejected", async () => {
      await expect(createClientSocket("invalid_token_string")).rejects.toThrow(
        "Invalid socket authentication"
      );
    });

    it("4. authentication cannot be spoofed using unauthenticated options", async () => {
      const client = ioClient(serverAddress, {
        auth: { userId: user1._id.toString() }, // Spoofed ID without valid JWT token
        transports: ["websocket"],
        forceNew: true,
        reconnection: false,
      });
      activeClients.push(client);

      const err = await new Promise((resolve) => {
        client.on("connect_error", (e) => resolve(e));
      });
      expect(err.message).toBe("Authentication token required");
    });
  });

  // ==================================================
  // STEP 4: PEER INTERVIEW ROOM FLOW
  // ==================================================
  describe("Peer Interview Room Flow", () => {
    let room;

    beforeEach(async () => {
      room = await PeerInterview.create({
        host: user1._id,
        roomCode: "ROOM_TEST_100",
        status: "waiting",
        participants: [
          { user: user1._id, role: "interviewer" },
          { user: user2._id, role: "candidate" },
        ],
      });
    });

    it("1. authenticated host joins room and receives room_joined event", async () => {
      const client1 = await createClientSocket(token1);

      const roomJoinedPromise = new Promise((resolve) => {
        client1.on("room_joined", (data) => resolve(data));
      });

      client1.emit("join_room", {
        roomCode: room.roomCode,
        displayName: "Host Alice",
      });

      const response = await roomJoinedPromise;
      expect(response.roomCode).toBe(room.roomCode);
      expect(response.status).toBe("waiting");
      expect(response.participants).toBe(2);
    });

    it("2. second participant joining triggers participant_joined event for existing user", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode, displayName: "Host Alice" });
      await new Promise((r) => setTimeout(r, 50));

      const participantJoinedPromise = new Promise((resolve) => {
        client1.on("participant_joined", (data) => resolve(data));
      });

      client2.emit("join_room", { roomCode: room.roomCode, displayName: "Peer Bob" });

      const notification = await participantJoinedPromise;
      expect(notification.userId).toBe(user2._id.toString());
      expect(notification.displayName).toBe("Peer Bob");
    });

    it("3. unauthorized user is rejected with ROOM_ACCESS_DENIED", async () => {
      const client3 = await createClientSocket(token3);

      const errorPromise = new Promise((resolve) => {
        client3.on("socket_error", (err) => resolve(err));
      });

      client3.emit("join_room", { roomCode: room.roomCode });

      const err = await errorPromise;
      expect(err.code).toBe("ROOM_ACCESS_DENIED");
      expect(err.message).toBe("You are not authorized to join this room");
    });

    it("4. leaving room emits participant_left to remaining participants", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode });
      client2.emit("join_room", { roomCode: room.roomCode });
      await new Promise((r) => setTimeout(r, 50));

      const leftPromise = new Promise((resolve) => {
        client1.on("participant_left", (data) => resolve(data));
      });

      client2.emit("leave_room", { roomCode: room.roomCode });

      const leftEvent = await leftPromise;
      expect(leftEvent.userId).toBe(user2._id.toString());
      expect(leftEvent.roomCode).toBe(room.roomCode);
    });
  });

  // ==================================================
  // STEP 5: WEBRTC SIGNALING
  // ==================================================
  describe("WebRTC Signaling", () => {
    let room;

    beforeEach(async () => {
      room = await PeerInterview.create({
        host: user1._id,
        roomCode: "SIGNAL_ROOM_200",
        status: "waiting",
        participants: [
          { user: user1._id, role: "interviewer" },
          { user: user2._id, role: "candidate" },
        ],
      });
    });

    it("1. relays WebRTC offer to target participant", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode });
      client2.emit("join_room", { roomCode: room.roomCode });
      await new Promise((r) => setTimeout(r, 50));

      const offerPromise = new Promise((resolve) => {
        client2.on("webrtc_offer", (data) => resolve(data));
      });

      const sampleOffer = { type: "offer", sdp: "v=0\r\no=- 12345 IN IP4..." };
      client1.emit("webrtc_offer", {
        roomCode: room.roomCode,
        offer: sampleOffer,
        senderDisplayName: "Host Alice",
      });

      const received = await offerPromise;
      expect(received.offer).toEqual(sampleOffer);
      expect(received.senderUserId).toBe(user1._id.toString());
      expect(received.senderSocketId).toBe(client1.id);
    });

    it("2. relays WebRTC answer to target participant", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode });
      client2.emit("join_room", { roomCode: room.roomCode });
      await new Promise((r) => setTimeout(r, 50));

      const answerPromise = new Promise((resolve) => {
        client1.on("webrtc_answer", (data) => resolve(data));
      });

      const sampleAnswer = { type: "answer", sdp: "v=0\r\no=- 67890 IN IP4..." };
      client2.emit("webrtc_answer", {
        roomCode: room.roomCode,
        answer: sampleAnswer,
      });

      const received = await answerPromise;
      expect(received.answer).toEqual(sampleAnswer);
      expect(received.senderUserId).toBe(user2._id.toString());
      expect(received.senderSocketId).toBe(client2.id);
    });

    it("3. relays ICE candidate to target participant", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode });
      client2.emit("join_room", { roomCode: room.roomCode });
      await new Promise((r) => setTimeout(r, 50));

      const icePromise = new Promise((resolve) => {
        client2.on("webrtc_ice_candidate", (data) => resolve(data));
      });

      const sampleCandidate = { candidate: "candidate:1 1 UDP 2013266431...", sdpMid: "0" };
      client1.emit("webrtc_ice_candidate", {
        roomCode: room.roomCode,
        candidate: sampleCandidate,
      });

      const received = await icePromise;
      expect(received.candidate).toEqual(sampleCandidate);
      expect(received.senderUserId).toBe(user1._id.toString());
    });

    it("4. rejects signaling from client not joined in target room", async () => {
      const client3 = await createClientSocket(token3);

      const errorPromise = new Promise((resolve) => {
        client3.on("socket_error", (err) => resolve(err));
      });

      client3.emit("webrtc_offer", {
        roomCode: room.roomCode,
        offer: { type: "offer", sdp: "test" },
      });

      const err = await errorPromise;
      expect(err.code).toBe("NOT_IN_ROOM");
      expect(err.message).toContain("not authorized");
    });
  });

  // ==================================================
  // STEP 6: DISCONNECT & CLEANUP
  // ==================================================
  describe("Disconnect & Cleanup", () => {
    let room;

    beforeEach(async () => {
      room = await PeerInterview.create({
        host: user1._id,
        roomCode: "DISCONNECT_ROOM_300",
        status: "waiting",
        participants: [
          { user: user1._id, role: "interviewer" },
          { user: user2._id, role: "candidate" },
        ],
      });
    });

    it("1. socket disconnect emits participant_left to room", async () => {
      const client1 = await createClientSocket(token1);
      const client2 = await createClientSocket(token2);

      client1.emit("join_room", { roomCode: room.roomCode });
      client2.emit("join_room", { roomCode: room.roomCode });
      await new Promise((r) => setTimeout(r, 50));

      const disconnectPromise = new Promise((resolve) => {
        client1.on("participant_left", (data) => resolve(data));
      });

      client2.disconnect();

      const event = await disconnectPromise;
      expect(event.userId).toBe(user2._id.toString());
      expect(event.roomCode).toBe(room.roomCode);
    });

    it("2. server handles unexpected disconnect gracefully", async () => {
      const client1 = await createClientSocket(token1);
      client1.disconnect();
      await new Promise((r) => setTimeout(r, 50));

      const newClient = await createClientSocket(token2);
      expect(newClient.connected).toBe(true);
    });
  });

  // ==================================================
  // STEP 7: ERROR HANDLING & MALFORMED PAYLOADS
  // ==================================================
  describe("Error Handling & Malformed Payloads", () => {
    it("1. emits INVALID_PAYLOAD error for non-object join_room payload", async () => {
      const client = await createClientSocket(token1);

      const errPromise = new Promise((resolve) => {
        client.on("socket_error", (err) => resolve(err));
      });

      client.emit("join_room", "invalid_string_payload");

      const err = await errPromise;
      expect(err.code).toBe("INVALID_PAYLOAD");
    });

    it("2. emits ROOM_CODE_REQUIRED error when roomCode is missing", async () => {
      const client = await createClientSocket(token1);

      const errPromise = new Promise((resolve) => {
        client.on("socket_error", (err) => resolve(err));
      });

      client.emit("join_room", {});

      const err = await errPromise;
      expect(err.code).toBe("ROOM_CODE_REQUIRED");
    });

    it("3. emits ROOM_NOT_FOUND error for non-existent room code", async () => {
      const client = await createClientSocket(token1);

      const errPromise = new Promise((resolve) => {
        client.on("socket_error", (err) => resolve(err));
      });

      client.emit("join_room", { roomCode: "NON_EXISTENT_999" });

      const err = await errPromise;
      expect(err.code).toBe("ROOM_NOT_FOUND");
    });

    it("4. emits ROOM_UNAVAILABLE error when room is completed or cancelled", async () => {
      const completedRoom = await PeerInterview.create({
        host: user1._id,
        roomCode: "COMPLETED_ROOM_400",
        status: "completed",
        participants: [{ user: user1._id, role: "interviewer" }],
      });

      const client = await createClientSocket(token1);

      const errPromise = new Promise((resolve) => {
        client.on("socket_error", (err) => resolve(err));
      });

      client.emit("join_room", { roomCode: completedRoom.roomCode });

      const err = await errPromise;
      expect(err.code).toBe("ROOM_UNAVAILABLE");
    });

    it("5. handles AI interview socket handlers cleanly", async () => {
      const client = await createClientSocket(token1);

      client.emit("ai_interview:join", { interviewId: "interview_123" });
      client.emit("ai_interview:candidate_speaking", {
        interviewId: "interview_123",
        isSpeaking: true,
        text: "Hello AI",
      });
      client.emit("ai_interview:ai_thinking", {
        interviewId: "interview_123",
        isThinking: true,
      });

      await new Promise((r) => setTimeout(r, 50));
      expect(client.connected).toBe(true);
    });
  });
});
