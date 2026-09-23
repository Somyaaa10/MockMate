const crypto = require("crypto");
const PeerInterview = require("../models/peerInterview.model");
const ApiError = require("../utils/ApiError");

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
  const validTypes = ["technical", "hr", "behavioral", "mixed"];
  const validDifficulties = ["easy", "medium", "hard"];

  const type = interviewType && validTypes.includes(interviewType.toLowerCase())
    ? interviewType.toLowerCase()
    : "technical";

  const diff = difficulty && validDifficulties.includes(difficulty.toLowerCase())
    ? difficulty.toLowerCase()
    : "medium";

  let roomCode = generateRoomCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await PeerInterview.findOne({ roomCode });
    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const peerInterview = await PeerInterview.create({
    host: userId,
    roomCode,
    title: (title && title.trim()) ? title.trim() : "Peer Mock Interview",
    interviewType: type,
    difficulty: diff,
    status: "waiting",
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
    host: peerInterview.host,
    participants: peerInterview.participants,
    createdAt: peerInterview.createdAt,
  };
};

// Join peer interview
const joinPeerInterview = async ({ userId, roomCode }) => {
  if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const cleanRoomCode = roomCode.trim().toUpperCase();

  const peerInterview = await PeerInterview.findOne({
    roomCode: cleanRoomCode,
  });

  if (!peerInterview) {
    throw new ApiError(404, "Peer interview room not found");
  }

  // Check if user is already a participant
  const alreadyParticipant = peerInterview.participants.some(
    (participant) => participant.user.toString() === userId.toString(),
  );

  if (alreadyParticipant) {
    return {
      roomId: peerInterview._id,
      roomCode: peerInterview.roomCode,
      title: peerInterview.title,
      interviewType: peerInterview.interviewType,
      difficulty: peerInterview.difficulty,
      status: peerInterview.status,
      participants: peerInterview.participants,
    };
  }

  // Room must still be waiting for new participants
  if (peerInterview.status !== "waiting") {
    throw new ApiError(400, "This interview room is no longer accepting new participants");
  }

  // Maximum 2 participants
  if (peerInterview.participants.length >= 2) {
    throw new ApiError(409, "Interview room is full");
  }

  // Atomic update to prevent race conditions during simultaneous joins
  const updatedInterview = await PeerInterview.findOneAndUpdate(
    {
      _id: peerInterview._id,
      status: "waiting",
      "participants.user": { $ne: userId },
      $expr: { $lt: [{ $size: "$participants" }, 2] },
    },
    {
      $push: {
        participants: {
          user: userId,
          role: "candidate",
          joinedAt: new Date(),
          leftAt: null,
        },
      },
    },
    { new: true }
  );

  if (!updatedInterview) {
    // Re-fetch to determine specific failure cause
    const refetched = await PeerInterview.findById(peerInterview._id);
    if (!refetched) throw new ApiError(404, "Peer interview room not found");

    const isNowParticipant = refetched.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (isNowParticipant) {
      return {
        roomId: refetched._id,
        roomCode: refetched.roomCode,
        title: refetched.title,
        interviewType: refetched.interviewType,
        difficulty: refetched.difficulty,
        status: refetched.status,
        participants: refetched.participants,
      };
    }

    if (refetched.participants.length >= 2) {
      throw new ApiError(409, "Interview room is full");
    }

    throw new ApiError(400, "Unable to join interview room");
  }

  console.log("✅ Participant joined:", {
    roomCode: updatedInterview.roomCode,
    userId: userId.toString(),
    participants: updatedInterview.participants.length,
  });

  return {
    roomId: updatedInterview._id,
    roomCode: updatedInterview.roomCode,
    title: updatedInterview.title,
    interviewType: updatedInterview.interviewType,
    difficulty: updatedInterview.difficulty,
    status: updatedInterview.status,
    participants: updatedInterview.participants,
  };
};

// Start peer interview
const startPeerInterview = async ({ userId, roomCode }) => {
  if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const cleanRoomCode = roomCode.trim().toUpperCase();

  const peerInterview = await PeerInterview.findOne({
    roomCode: cleanRoomCode,
  });

  if (!peerInterview) {
    throw new ApiError(404, "Peer interview room not found");
  }

  // Only host can start
  if (peerInterview.host.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the host can start the interview");
  }

  // Check state
  if (peerInterview.status === "active") {
    throw new ApiError(400, "Interview has already been started");
  }

  if (peerInterview.status === "completed" || peerInterview.status === "cancelled") {
    throw new ApiError(400, "Cannot start a finished or cancelled interview");
  }

  if (peerInterview.status !== "waiting") {
    throw new ApiError(400, "Interview cannot be started");
  }

  // Need 2 participants who have not left
  const activeParticipants = peerInterview.participants.filter((p) => !p.leftAt);
  if (activeParticipants.length < 2) {
    throw new ApiError(400, "Waiting for another participant to join before starting");
  }

  // Start interview
  peerInterview.status = "active";
  peerInterview.startedAt = new Date();

  await peerInterview.save();

  console.log("✅ Peer interview started successfully:", peerInterview.roomCode);

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
  if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const cleanRoomCode = roomCode.trim().toUpperCase();

  const peerInterview = await PeerInterview.findOne({
    roomCode: cleanRoomCode,
  });

  if (!peerInterview) {
    throw new ApiError(404, "Peer interview room not found");
  }

  // Only host can complete
  if (peerInterview.host.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the host can complete the interview");
  }

  if (peerInterview.status === "completed") {
    throw new ApiError(400, "Interview is already completed");
  }

  if (peerInterview.status !== "active") {
    throw new ApiError(400, "Only an active interview can be completed");
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
  if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const cleanRoomCode = roomCode.trim().toUpperCase();

  const peerInterview = await PeerInterview.findOne({
    roomCode: cleanRoomCode,
  })
    .populate("host", "fullName email")
    .populate("participants.user", "fullName email");

  if (!peerInterview) {
    throw new ApiError(404, "Peer interview room not found");
  }

  // User must be host or participant
  const isHost = peerInterview.host._id.toString() === userId.toString();

  const isParticipant = peerInterview.participants.some(
    (participant) => participant.user && participant.user._id.toString() === userId.toString(),
  );

  if (!isHost && !isParticipant) {
    throw new ApiError(403, "You are not authorized to access this interview");
  }

  return peerInterview;
};

// Get user peer interviews
const getUserPeerInterviews = async (userId) => {
  const interviews = await PeerInterview.find({
    $or: [{ host: userId }, { "participants.user": userId }],
  })
    .populate("host", "fullName email")
    .populate("participants.user", "fullName email")
    .sort({ createdAt: -1 });

  return interviews;
};

// Leave peer interview
const leavePeerInterview = async ({ userId, roomCode }) => {
  if (!roomCode || typeof roomCode !== "string" || !roomCode.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const cleanRoomCode = roomCode.trim().toUpperCase();

  const peerInterview = await PeerInterview.findOne({
    roomCode: cleanRoomCode,
  });

  if (!peerInterview) {
    throw new ApiError(404, "Peer interview room not found");
  }

  if (peerInterview.status === "completed") {
    throw new ApiError(400, "Cannot leave a completed interview");
  }

  if (peerInterview.status === "cancelled") {
    throw new ApiError(400, "Cannot leave a cancelled interview");
  }

  // Find the participant
  const participant = peerInterview.participants.find(
    (p) => p.user.toString() === userId.toString(),
  );

  if (!participant) {
    throw new ApiError(403, "You are not a participant in this interview");
  }

  // Already left
  if (participant.leftAt) {
    return {
      roomId: peerInterview._id,
      roomCode: peerInterview.roomCode,
      status: peerInterview.status,
      leftAt: participant.leftAt,
    };
  }

  // Mark participant as left
  participant.leftAt = new Date();

  // If host leaves waiting room, cancel it
  if (peerInterview.status === "waiting" && peerInterview.host.toString() === userId.toString()) {
    peerInterview.status = "cancelled";
  }

  await peerInterview.save();

  return {
    roomId: peerInterview._id,
    roomCode: peerInterview.roomCode,
    status: peerInterview.status,
    userId,
    leftAt: participant.leftAt,
  };
};

module.exports = {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
  getUserPeerInterviews,
  leavePeerInterview,
};
