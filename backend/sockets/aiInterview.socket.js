/**
 * Real-time AI Interview Socket Handler
 */
const registerAIInterviewSocket = (io, socket) => {
  // Join interview room
  socket.on("ai_interview:join", ({ interviewId }) => {
    if (!interviewId) return;
    const roomName = `ai_interview_${interviewId}`;
    socket.join(roomName);
    console.log(`🎙️ User ${socket.userId} joined AI Interview room: ${roomName}`);
  });

  // Candidate transcript stream / speaking updates
  socket.on("ai_interview:candidate_speaking", ({ interviewId, isSpeaking, text }) => {
    if (!interviewId) return;
    const roomName = `ai_interview_${interviewId}`;
    socket.to(roomName).emit("ai_interview:candidate_status", {
      isSpeaking,
      text,
      timestamp: Date.now(),
    });
  });

  // AI thinking indicator update
  socket.on("ai_interview:ai_thinking", ({ interviewId, isThinking }) => {
    if (!interviewId) return;
    const roomName = `ai_interview_${interviewId}`;
    io.in(roomName).emit("ai_interview:status_update", {
      status: isThinking ? "THINKING" : "IDLE",
    });
  });
};

module.exports = registerAIInterviewSocket;
