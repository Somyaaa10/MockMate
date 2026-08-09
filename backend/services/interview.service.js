const Interview = require("../models/interview.model");
const Resume = require("../models/resume.model");
const aiService = require("./ai.service");

const createInterview = async ({
  userId,
  resumeId,
  interviewType,
  difficulty,
  numberOfQuestions,
}) => {
  // 1. Find resume and verify ownership
  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (!resume.extractedText) {
    throw new Error("Resume text is not available");
  }

  // 2. Generate questions using Gemini
  const questions = await aiService.generateInterviewQuestions({
    resumeText: resume.extractedText,
    interviewType,
    difficulty,
    numberOfQuestions,
  });

  // 3. Create interview
  const interview = await Interview.create({
    user: userId,
    resume: resumeId,
    interviewType,
    difficulty,
    numberOfQuestions,
    questions: questions.map((question) => ({
      question,
    })),
  });

  return interview;
};

// start interview
const startInterview = async (interviewId, userId) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  if (interview.status === "completed") {
    throw new Error("Interview is already completed");
  }

  if (interview.status === "in_progress") {
    throw new Error("Interview is already in progress");
  }

  if (interview.status !== "created") {
    throw new Error("Interview cannot be started");
  }

  if (!interview.questions.length) {
    throw new Error("Interview has no questions");
  }

  interview.status = "in_progress";
  interview.startedAt = new Date();
  interview.currentQuestionIndex = 0;

  await interview.save();

  const currentQuestion = interview.questions[interview.currentQuestionIndex];

  return {
    interviewId: interview._id,
    questionNumber: interview.currentQuestionIndex + 1,
    totalQuestions: interview.questions.length,
    question: currentQuestion.question,
  };
};

// submitAns
const submitAnswer = async ({ interviewId, userId, answer }) => {
  // 1. Find interview and verify ownership
  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  // 2. Check interview status
  if (interview.status !== "in_progress") {
    throw new Error("Interview is not in progress");
  }

  // 3. Validate answer
  if (!answer || !answer.trim()) {
    throw new Error("Answer is required");
  }

  // 4. Get current question
  const currentIndex = interview.currentQuestionIndex;

  const currentQuestion = interview.questions[currentIndex];

  if (!currentQuestion) {
    throw new Error("Current question not found");
  }

  // Prevent duplicate answer
  if (currentQuestion.answeredAt) {
    throw new Error("Current question has already been answered");
  }

  // 5. Get resume
  const resume = await Resume.findOne({
    _id: interview.resume,
    user: userId,
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (!resume.extractedText) {
    throw new Error("Resume text is not available");
  }

  // 6. Evaluate answer using Gemini
  const evaluation = await aiService.evaluateInterviewAnswer({
    question: currentQuestion.question,
    answer,
    resumeText: resume.extractedText,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
  });

  // 7. Save answer and evaluation
  currentQuestion.answer = answer;
  currentQuestion.score = evaluation.score;
  currentQuestion.feedback = evaluation.feedback;
  currentQuestion.strengths = evaluation.strengths;
  currentQuestion.improvements = evaluation.improvements;
  currentQuestion.answeredAt = new Date();

  // 8. Move to next question
  interview.currentQuestionIndex += 1;

  const isCompleted =
    interview.currentQuestionIndex >= interview.questions.length;

  // 9. Complete interview
  if (isCompleted) {
    interview.status = "completed";
    interview.completedAt = new Date();

    // Calculate overall score
    const scores = interview.questions
      .map((question) => question.score)
      .filter((score) => score !== null && score !== undefined);

    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    interview.overallScore =
      scores.length > 0 ? Number((totalScore / scores.length).toFixed(2)) : 0;

    // -----------------------------------------
    // 10. Generate final AI interview feedback
    // -----------------------------------------
    console.log("🤖 Generating final interview feedback...");

    const finalFeedback = await aiService.generateFinalInterviewFeedback({
      questions: interview.questions,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
    });

    console.log("✅ Final interview feedback generated");

    interview.finalFeedback = finalFeedback;
  }

  // 11. Save interview
  await interview.save();

  // 12. Return result
  return {
    evaluation,

    completed: isCompleted,

    questionNumber: isCompleted
      ? interview.questions.length
      : interview.currentQuestionIndex + 1,

    nextQuestion: isCompleted
      ? null
      : interview.questions[interview.currentQuestionIndex].question,

    overallScore: interview.overallScore,

    finalFeedback: isCompleted ? interview.finalFeedback : null,
  };
};

const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return interview;
};

const getUserInterviews = async (userId) => {
  const interviews = await Interview.find({
    user: userId,
  })
    .populate("resume", "fileName")
    .sort({ createdAt: -1 });

  return interviews;
};

module.exports = {
  createInterview,
  startInterview,
  submitAnswer,
  getInterviewById,
  getUserInterviews,
};
