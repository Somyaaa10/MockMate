const PeerInterview = require("../models/peerInterview.model");

const registerPeerInterviewSocket = (io, socket) => {
  console.log("🎯 Peer interview socket registered:", socket.id);

  // ====================================
  // JOIN ROOM
  // ====================================
  socket.on("join_room", async ({ roomCode }) => {
    try {
      console.log("=================================");
      console.log("📥 join_room received");
      console.log("Socket:", socket.id);
      console.log("Room:", roomCode);
      console.log("=================================");

      if (!roomCode) {
        socket.emit("socket_error", {
          message: "Room code is required",
        });
        return;
      }

      const normalizedRoomCode = roomCode.trim().toUpperCase();

      console.log("🔎 Searching room:", normalizedRoomCode);

      const peerInterview = await PeerInterview.findOne({
        roomCode: normalizedRoomCode,
      });

      if (!peerInterview) {
        console.log("❌ Room not found");

        socket.emit("socket_error", {
          message: "Peer interview room not found",
        });

        return;
      }

      console.log("✅ Room found:", peerInterview.roomCode);

      socket.join(normalizedRoomCode);

      socket.roomCode = normalizedRoomCode;

      console.log(`👤 ${socket.id} joined ${normalizedRoomCode}`);

      socket.emit("room_joined", {
        roomCode: normalizedRoomCode,
        status: peerInterview.status,
        participants: peerInterview.participants.length,
      });

      socket.to(normalizedRoomCode).emit("participant_joined", {
        socketId: socket.id,
      });
    } catch (error) {
      console.error("❌ join_room error:", error);

      socket.emit("socket_error", {
        message: error.message,
      });
    }
  });

  // ====================================
  // WEBRTC OFFER
  // ====================================
  socket.on("webrtc_offer", ({ roomCode, offer }) => {
    const code = roomCode?.trim().toUpperCase();

    if (!code || !offer) {
      return;
    }

    console.log("📤 WebRTC offer:", code);

    socket.to(code).emit("webrtc_offer", {
      offer,
    });
  });

  // ====================================
  // WEBRTC ANSWER
  // ====================================
  socket.on("webrtc_answer", ({ roomCode, answer }) => {
    const code = roomCode?.trim().toUpperCase();

    if (!code || !answer) {
      return;
    }

    console.log("📤 WebRTC answer:", code);

    socket.to(code).emit("webrtc_answer", {
      answer,
    });
  });

  // ====================================
  // ICE CANDIDATE
  // ====================================
  socket.on("webrtc_ice_candidate", ({ roomCode, candidate }) => {
    const code = roomCode?.trim().toUpperCase();

    if (!code || !candidate) {
      return;
    }

    socket.to(code).emit("webrtc_ice_candidate", {
      candidate,
    });
  });

  // ====================================
  // DISCONNECT
  // ====================================
  socket.on("disconnect", () => {
    console.log("🔌 Peer socket disconnected:", socket.id);

    if (socket.roomCode) {
      socket.to(socket.roomCode).emit("participant_left", {
        socketId: socket.id,
      });
    }
  });
};

module.exports = registerPeerInterviewSocket;
