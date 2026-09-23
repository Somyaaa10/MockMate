const PeerInterview = require("../models/peerInterview.model");

const registerPeerInterviewSocket = (io, socket) => {
  console.log(
    `[SOCKET] Connected: socketId=${socket.id} userId=${socket.userId}`
  );

  // JOIN ROOM
  socket.on("join_room", async (data) => {
    try {
      if (!data || typeof data !== "object") {
        socket.emit("socket_error", {
          code: "INVALID_PAYLOAD",
          message: "Invalid payload format",
        });
        return;
      }

      const { roomCode } = data;

      if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
        socket.emit("socket_error", {
          code: "ROOM_CODE_REQUIRED",
          message: "Room code is required",
        });
        return;
      }

      const normalizedRoomCode = roomCode.trim().toUpperCase();

      const peerInterview = await PeerInterview.findOne({
        roomCode: normalizedRoomCode,
      });

      if (!peerInterview) {
        socket.emit("socket_error", {
          code: "ROOM_NOT_FOUND",
          message: "Peer interview room not found",
        });
        return;
      }

      // Check if room is available
      if (
        peerInterview.status === "completed" ||
        peerInterview.status === "cancelled"
      ) {
        socket.emit("socket_error", {
          code: "ROOM_UNAVAILABLE",
          message: "This interview room is completed or cancelled",
        });
        return;
      }

      // Security check: User must be host or listed participant in MongoDB
      const isHost = peerInterview.host.toString() === socket.userId.toString();
      const isParticipant = peerInterview.participants.some(
        (p) => p.user && p.user.toString() === socket.userId.toString(),
      );

      if (!isHost && !isParticipant) {
        console.log(
          `[SOCKET] Unauthorized join attempt socketId=${socket.id} userId=${socket.userId} room=${normalizedRoomCode}`,
        );
        socket.emit("socket_error", {
          code: "ROOM_ACCESS_DENIED",
          message: "You are not authorized to join this room",
        });
        return;
      }

      // Clean up previous room membership for this socket if any
      if (socket.roomCode && socket.roomCode !== normalizedRoomCode) {
        socket.leave(socket.roomCode);
      }

      socket.join(normalizedRoomCode);
      socket.roomCode = normalizedRoomCode;

      console.log(
        `[SOCKET] Joined room: socketId=${socket.id} userId=${socket.userId} room=${normalizedRoomCode}`
      );

      socket.emit("room_joined", {
        roomCode: normalizedRoomCode,
        status: peerInterview.status,
        participants: peerInterview.participants.length,
      });

      socket.to(normalizedRoomCode).emit("participant_joined", {
        socketId: socket.id,
        userId: socket.userId,
      });
    } catch (error) {
      console.error("[SOCKET] join_room error:", error.message);
      socket.emit("socket_error", {
        code: "SERVER_ERROR",
        message: "Failed to join room",
      });
    }
  });

  // WEBRTC OFFER
  socket.on("webrtc_offer", (data) => {
    try {
      if (!data || typeof data !== "object") return;
      const { roomCode, offer } = data;
      const code = roomCode?.trim().toUpperCase();

      if (!code || !offer) return;

      // Security check: Socket must be in the target room
      if (socket.roomCode !== code || !socket.rooms.has(code)) {
        socket.emit("socket_error", {
          code: "NOT_IN_ROOM",
          message:
            "You are not authorized to send signaling messages to this room",
        });
        return;
      }

      console.log(
        `[SOCKET] Relay WebRTC offer in room=${code} socketId=${socket.id} userId=${socket.userId}`
      );

      socket.to(code).emit("webrtc_offer", {
        offer,
        senderUserId: socket.userId,
        senderSocketId: socket.id,
      });
    } catch (error) {
      console.error("[SOCKET] webrtc_offer error:", error.message);
    }
  });

  // WEBRTC ANSWER
  socket.on("webrtc_answer", (data) => {
    try {
      if (!data || typeof data !== "object") return;
      const { roomCode, answer } = data;
      const code = roomCode?.trim().toUpperCase();

      if (!code || !answer) return;

      // Security check: Socket must be in the target room
      if (socket.roomCode !== code || !socket.rooms.has(code)) {
        socket.emit("socket_error", {
          code: "NOT_IN_ROOM",
          message:
            "You are not authorized to send signaling messages to this room",
        });
        return;
      }

      console.log(
        `[SOCKET] Relay WebRTC answer in room=${code} socketId=${socket.id} userId=${socket.userId}`
      );

      socket.to(code).emit("webrtc_answer", {
        answer,
        senderUserId: socket.userId,
        senderSocketId: socket.id,
      });
    } catch (error) {
      console.error("[SOCKET] webrtc_answer error:", error.message);
    }
  });

  // ICE CANDIDATE
  socket.on("webrtc_ice_candidate", (data) => {
    try {
      if (!data || typeof data !== "object") return;
      const { roomCode, candidate } = data;
      const code = roomCode?.trim().toUpperCase();

      if (!code || !candidate) return;

      // Security check: Socket must be in the target room
      if (socket.roomCode !== code || !socket.rooms.has(code)) {
        socket.emit("socket_error", {
          code: "NOT_IN_ROOM",
          message:
            "You are not authorized to send signaling messages to this room",
        });
        return;
      }

      socket.to(code).emit("webrtc_ice_candidate", {
        candidate,
        senderUserId: socket.userId,
        senderSocketId: socket.id,
      });
    } catch (error) {
      console.error("[SOCKET] webrtc_ice_candidate error:", error.message);
    }
  });

  // INTERVIEW STARTED BROADCAST
  socket.on("interview_started", (data) => {
    try {
      const code = data?.roomCode?.trim().toUpperCase();
      if (!code || socket.roomCode !== code) return;

      io.to(code).emit("room_started", {
        roomCode: code,
      });
    } catch (error) {
      console.error("[SOCKET] interview_started error:", error.message);
    }
  });

  // INTERVIEW COMPLETED BROADCAST
  socket.on("interview_completed", (data) => {
    try {
      const code = data?.roomCode?.trim().toUpperCase();
      if (!code || socket.roomCode !== code) return;

      io.to(code).emit("room_completed", {
        roomCode: code,
      });
    } catch (error) {
      console.error("[SOCKET] interview_completed error:", error.message);
    }
  });

  // LEAVE ROOM
  socket.on("leave_room", (data) => {
    try {
      const code = data?.roomCode?.trim().toUpperCase() || socket.roomCode;
      if (!code) return;

      if (socket.rooms.has(code)) {
        socket.to(code).emit("participant_left", {
          socketId: socket.id,
          userId: socket.userId,
          roomCode: code,
        });
        socket.leave(code);
      }
      if (socket.roomCode === code) {
        delete socket.roomCode;
      }
    } catch (error) {
      console.error("[SOCKET] leave_room error:", error.message);
    }
  });

  // DISCONNECT
  socket.on("disconnect", async () => {
    try {
      console.log(
        `[SOCKET] Disconnected: socketId=${socket.id} userId=${socket.userId}`
      );

      if (!socket.roomCode || !socket.userId) {
        return;
      }

      const roomCode = socket.roomCode;

      // Notify remaining participants in the room
      socket.to(roomCode).emit("participant_left", {
        socketId: socket.id,
        userId: socket.userId,
        roomCode,
      });
    } catch (error) {
      console.error("[SOCKET] Disconnect handling error:", error.message);
    }
  });
};

module.exports = registerPeerInterviewSocket;
