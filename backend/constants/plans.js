const PLANS = {
  FREE: {
    name: "FREE",
    interviewLimit: 2,
    resumeAnalysis: true,
    advancedFeedback: false,
    peerInterview: true,
    recording: false,
  },
  PRO: {
    name: "PRO",
    interviewLimit: 1000,
    resumeAnalysis: true,
    advancedFeedback: true,
    peerInterview: true,
    recording: false,
  },
};

module.exports = PLANS;
