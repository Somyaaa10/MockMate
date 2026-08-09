const Interview = require("../models/interview.model");

const getDashboard = async (userId) => {
  const interviews = await Interview.find({
    user: userId,
  })
    .select(
      "interviewType difficulty numberOfQuestions status overallScore createdAt completedAt",
    )
    .sort({ createdAt: -1 });

  const totalInterviews = interviews.length;

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed",
  );

  const inProgressInterviews = interviews.filter(
    (interview) => interview.status === "in_progress",
  );

  const scores = completedInterviews
    .map((interview) => interview.overallScore)
    .filter((score) => score !== null && score !== undefined);

  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  const averageScore =
    scores.length > 0 ? Number((totalScore / scores.length).toFixed(2)) : 0;

  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const recentInterviews = interviews.slice(0, 5).map((interview) => ({
    interviewId: interview._id,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    numberOfQuestions: interview.numberOfQuestions,
    status: interview.status,
    overallScore: interview.overallScore,
    createdAt: interview.createdAt,
    completedAt: interview.completedAt,
  }));

  return {
    totalInterviews,
    completedInterviews: completedInterviews.length,
    inProgressInterviews: inProgressInterviews.length,
    averageScore,
    bestScore,
    recentInterviews,
  };
};

module.exports = {
  getDashboard,
};
