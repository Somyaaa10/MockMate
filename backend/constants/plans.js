const PLANS = {
  FREE: {
    name: "FREE",
    interviewLimit: 2,
    resumeAnalysis: true,
    advancedFeedback: false,
    peerInterview: true,
    recording: true,
  },
  PRO: {
    name: "PRO",
    interviewLimit: 20,
    resumeAnalysis: true,
    advancedFeedback: true,
    peerInterview: true,
    recording: true,
  },
};

module.exports = PLANS;
