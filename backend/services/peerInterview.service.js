const crypto = require("crypto");
const PeerInterview = require("../models/peerInterview.model");

// Generate room code
const generateRoomCode = () => {
  return `MOCK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

// Create peer interview
const createPeerInterview = async ({
  userId,
  title,
  interviewType,
  difficulty,
}) => {
  const roomCode = generateRoomCode();

  const peerInterview = await PeerInterview.create({
    host: userId,
    roomCode,
    title: title || "Peer Mock Interview",
    interviewType: interviewType || "technical",
    difficulty: difficulty || "medium",

    participants: [
      {
        user: userId,
        role: "interviewer",
        joinedAt: new Date(),
      },
    ],
  });

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    title: peerInterview.title,
    interviewType: peerInterview.interviewType,
    difficulty: peerInterview.difficulty,
    status: peerInterview.status,
  };
};

// Join peer interview
const joinPeerInterview = async ({ userId, roomCode }) => {
  const peerInterview = await PeerInterview.findOne({
    roomCode: roomCode.trim().toUpperCase(),
  });

  if (!peerInterview) {
    throw new Error("Peer interview room not found");
  }

  if (peerInterview.status !== "waiting") {
    throw new Error("This interview room is no longer available");
  }

  const alreadyParticipant = peerInterview.participants.some(
    (participant) => participant.user.toString() === userId.toString(),
  );

  if (alreadyParticipant) {
    return {
      roomId: peerInterview._id,
      roomCode: peerInterview.roomCode,
      status: peerInterview.status,
      participants: peerInterview.participants,
    };
  }

  if (peerInterview.participants.length >= 2) {
    throw new Error("Interview room is full");
  }

  peerInterview.participants.push({
    user: userId,
    role: "candidate",
    joinedAt: new Date(),
  });

  await peerInterview.save();

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    title: peerInterview.title,
    interviewType: peerInterview.interviewType,
    difficulty: peerInterview.difficulty,
    status: peerInterview.status,
    participants: peerInterview.participants,
  };
};

// Start peer interview
const startPeerInterview = async ({ userId, roomCode }) => {
  const peerInterview = await PeerInterview.findOne({
    roomCode: roomCode.trim().toUpperCase(),
  });

  if (!peerInterview) {
    throw new Error("Peer interview room not found");
  }

  // Only host can start
  if (peerInterview.host.toString() !== userId.toString()) {
    throw new Error("Only the host can start the interview");
  }

  if (peerInterview.status !== "waiting") {
    throw new Error("Interview cannot be started");
  }

  // Need two participants
  if (peerInterview.participants.length < 2) {
    throw new Error("Waiting for another participant to join");
  }

  peerInterview.status = "active";
  peerInterview.startedAt = new Date();

  await peerInterview.save();

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    status: peerInterview.status,
    participants: peerInterview.participants,
    startedAt: peerInterview.startedAt,
  };
};

// Complete peer interview
const completePeerInterview = async ({ userId, roomCode }) => {
  const peerInterview = await PeerInterview.findOne({
    roomCode: roomCode.trim().toUpperCase(),
  });

  if (!peerInterview) {
    throw new Error("Peer interview room not found");
  }

  // Only host can complete
  if (peerInterview.host.toString() !== userId.toString()) {
    throw new Error("Only the host can complete the interview");
  }

  if (peerInterview.status !== "active") {
    throw new Error("Only an active interview can be completed");
  }

  peerInterview.status = "completed";
  peerInterview.completedAt = new Date();

  await peerInterview.save();

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    status: peerInterview.status,
    startedAt: peerInterview.startedAt,
    completedAt: peerInterview.completedAt,
  };
};

// Get peer interview room details
const getPeerInterview = async ({ userId, roomCode }) => {
  const peerInterview = await PeerInterview.findOne({
    roomCode: roomCode.trim().toUpperCase(),
  }).populate("participants.user", "name email");

  if (!peerInterview) {
    throw new Error("Peer interview room not found");
  }

  // Only participants can access the room
  const isParticipant = peerInterview.participants.some(
    (participant) => participant.user._id.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new Error("You are not a participant in this interview");
  }

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    title: peerInterview.title,
    interviewType: peerInterview.interviewType,
    difficulty: peerInterview.difficulty,
    status: peerInterview.status,
    host: peerInterview.host,
    participants: peerInterview.participants,
    startedAt: peerInterview.startedAt,
    completedAt: peerInterview.completedAt,
  };
};

module.exports = {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
};
