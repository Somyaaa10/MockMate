const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Resume = require("../models/resume.model");
const User = require("../models/user.model");
const aiService = require("./ai.service");
const { checkAIInterviewQuota } = require("./quota.service");
const ApiError = require("../utils/ApiError");

const createInterview = async ({
  userId,
  resumeId,
  interviewType,
  difficulty,
  numberOfQuestions,
  targetRole,
  experienceLevel,
  durationMinutes,
}) => {
  // 0. Check server-side quota
  await checkAIInterviewQuota(userId);

  // 1. Validate required fields
  if (!resumeId) {
    throw new ApiError(400, "Resume is required");
  }

  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, "Invalid resume ID");
  }

  if (!interviewType) {
    throw new ApiError(400, "Interview type is required");
  }

  if (!difficulty) {
    throw new ApiError(400, "Difficulty is required");
  }

  if (!numberOfQuestions) {
    throw new ApiError(400, "Number of questions is required");
  }

  // 2. Validate interview type
  const allowedTypes = ["technical", "hr", "behavioral", "mixed"];

  if (!allowedTypes.includes(interviewType)) {
    throw new ApiError(400, "Invalid interview type");
  }

  // 3. Validate difficulty
  const allowedDifficulties = ["easy", "medium", "hard"];

  if (!allowedDifficulties.includes(difficulty)) {
    throw new ApiError(400, "Invalid difficulty");
  }

  // 4. Validate question count
  const questionCount = Number(numberOfQuestions);

  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > 20
  ) {
    throw new ApiError(400, "Number of questions must be between 1 and 20");
  }

  // 5. Find resume and user
  const [resume, user] = await Promise.all([
    Resume.findOne({ _id: resumeId, user: userId }),
    User.findById(userId),
  ]);

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new ApiError(400, "Resume text is not available");
  }

  const roleName = targetRole || "Software Developer";
  const levelName = experienceLevel || "Mid Level";
  const duration = Number(durationMinutes) || 15;

  // Build full candidate context for AI prompt
  const candidateContext = {
    candidateName: user?.fullName || "Candidate",
    targetRole: roleName,
    experienceLevel: levelName,
    skills: resume.skills || [],
    projects: resume.projects || [],
    experience: resume.experience || [],
    strengths: resume.strengths || [],
    weaknesses: resume.weaknesses || [],
    recommendedTopics: resume.recommendedTopics || [],
  };

  // 6. Generate AI Greeting & First Question using Gemini
  console.log("🤖 Generating AI greeting & first dynamic question...");
  const greetingData = await aiService.generateGreeting({
    candidateName: user?.fullName || "Candidate",
    targetRole: roleName,
    interviewType,
    difficulty,
    resumeText: resume.extractedText,
    candidateContext,
  });

  const firstQuestionText =
    greetingData.firstQuestion ||
    "Tell me about yourself and your background in software development.";

  // 7. Create interview session
  const interview = await Interview.create({
    user: userId,
    resume: resumeId,
    interviewType,
    difficulty,
    numberOfQuestions: questionCount,
    targetRole: roleName,
    experienceLevel: levelName,
    durationMinutes: duration,

    questions: [
      {
        question: firstQuestionText,
      },
    ],

    conversationHistory: [
      {
        speaker: "ai",
        text: greetingData.greeting || "Welcome to your MockMate AI Interview.",
        isFollowUp: false,
        timestamp: new Date(),
      },
      {
        speaker: "ai",
        text: firstQuestionText,
        isFollowUp: false,
        timestamp: new Date(),
      },
    ],
  });

  // 8. Return response
  return {
    interviewId: interview._id,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    numberOfQuestions: interview.numberOfQuestions,
    targetRole: interview.targetRole,
    experienceLevel: interview.experienceLevel,
    greeting: greetingData.greeting,
    firstQuestion: firstQuestionText,
    status: interview.status,
  };
};

// start interview (Atomic state transition & race-condition safe quota check)
const startInterview = async (interviewId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new ApiError(400, "Invalid interview ID");
  }

  const existing = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!existing) {
    throw new ApiError(404, "Interview session not found");
  }

  if (existing.status === "completed") {
    throw new ApiError(400, "Interview is already completed");
  }

  if (existing.status === "in_progress") {
    // Return existing progress
    const currentQ = existing.questions[existing.currentQuestionIndex] || existing.questions[0];
    return {
      interviewId: existing._id,
      questionNumber: existing.currentQuestionIndex + 1,
      totalQuestions: existing.numberOfQuestions,
      greeting: existing.conversationHistory[0]?.text || "",
      question: currentQ.question,
      targetRole: existing.targetRole,
      experienceLevel: existing.experienceLevel,
      difficulty: existing.difficulty,
    };
  }

  if (existing.status !== "created") {
    throw new ApiError(400, "Interview cannot be started");
  }

  // Check quota before moving from "created" to "in_progress"
  await checkAIInterviewQuota(userId);

  if (!existing.questions.length) {
    throw new ApiError(400, "Interview has no questions");
  }

  // Atomic update: only transition if status is still "created"
  const interview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      user: userId,
      status: "created",
    },
    {
      $set: {
        status: "in_progress",
        startedAt: new Date(),
        currentQuestionIndex: 0,
      },
    },
    { new: true }
  );

  if (!interview) {
    const refetched = await Interview.findOne({ _id: interviewId, user: userId });
    if (refetched && refetched.status === "in_progress") {
      const currentQ = refetched.questions[refetched.currentQuestionIndex] || refetched.questions[0];
      return {
        interviewId: refetched._id,
        questionNumber: refetched.currentQuestionIndex + 1,
        totalQuestions: refetched.numberOfQuestions,
        greeting: refetched.conversationHistory[0]?.text || "",
        question: currentQ.question,
        targetRole: refetched.targetRole,
        experienceLevel: refetched.experienceLevel,
        difficulty: refetched.difficulty,
      };
    }
    throw new ApiError(409, "Interview session status transition conflict");
  }

  const currentQuestion = interview.questions[0];

  return {
    interviewId: interview._id,
    questionNumber: 1,
    totalQuestions: interview.numberOfQuestions,
    greeting: interview.conversationHistory[0]?.text || "Welcome to your interview.",
    question: currentQuestion.question,
    targetRole: interview.targetRole,
    experienceLevel: interview.experienceLevel,
    difficulty: interview.difficulty,
  };
};

// submitAns (Real-Time Dynamic Evaluation & Question Decision)
const submitAnswer = async ({ interviewId, userId, answer }) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new ApiError(400, "Invalid interview ID");
  }

  // 1. Find interview and verify ownership
  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  // 2. Check interview status
  if (interview.status !== "in_progress") {
    throw new ApiError(
      400,
      interview.status === "completed"
        ? "Interview is already completed"
        : "Interview is not in progress"
    );
  }

  // 3. Validate answer
  if (!answer || !answer.trim()) {
    throw new ApiError(400, "Answer is required");
  }

  // 4. Get current question
  const currentIndex = interview.currentQuestionIndex;
  const currentQuestion = interview.questions[currentIndex];

  if (!currentQuestion) {
    throw new ApiError(400, "Current question not found");
  }

  // Prevent duplicate answer
  if (currentQuestion.answeredAt) {
    throw new ApiError(409, "Current question has already been answered");
  }

  // 5. Get resume
  const resume = await Resume.findOne({
    _id: interview.resume,
    user: userId,
  });

  if (!resume || !resume.extractedText) {
    throw new ApiError(404, "Resume text not found");
  }

  // 6. Evaluate candidate's answer using Gemini
  console.log(`🤖 Evaluating answer for question ${currentIndex + 1}...`);
  const evaluation = await aiService.evaluateInterviewAnswer({
    question: currentQuestion.question,
    answer: answer.trim(),
    resumeText: resume.extractedText,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
  });

  // 7. Record answer & evaluation
  currentQuestion.answer = answer.trim();
  currentQuestion.score = evaluation.score;
  currentQuestion.feedback = evaluation.feedback;
  currentQuestion.strengths = evaluation.strengths;
  currentQuestion.improvements = evaluation.improvements;
  currentQuestion.answeredAt = new Date();

  // Push candidate speech to conversation log
  interview.conversationHistory.push({
    speaker: "candidate",
    text: answer.trim(),
    isFollowUp: false,
    timestamp: new Date(),
  });

  // 8. Determine if interview is completed or next question needs to be dynamically generated
  const nextQuestionNum = currentIndex + 2; // 1-indexed next question
  let isCompleted = nextQuestionNum > interview.numberOfQuestions;

  let nextStep = null;

  if (!isCompleted) {
    console.log(`🤖 Dynamically generating question ${nextQuestionNum}/${interview.numberOfQuestions}...`);
    nextStep = await aiService.generateNextDynamicStep({
      resumeText: resume.extractedText,
      targetRole: interview.targetRole,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
      currentDifficulty: interview.difficulty,
      conversationHistory: interview.conversationHistory,
      lastAnswer: answer.trim(),
      lastEvaluation: evaluation,
      questionNumber: nextQuestionNum,
      totalQuestions: interview.numberOfQuestions,
      candidateContext: {
        skills: resume.skills || [],
        projects: resume.projects || [],
        experience: resume.experience || [],
        strengths: resume.strengths || [],
        weaknesses: resume.weaknesses || [],
        recommendedTopics: resume.recommendedTopics || [],
      },
    });

    if (nextStep.shouldEndInterview) {
      isCompleted = true;
    } else {
      // Add dynamic next question or follow-up question
      const newQuestionText = nextStep.nextQuestion || "Can you explain another technical project from your resume?";
      interview.questions.push({
        question: newQuestionText,
      });

      interview.conversationHistory.push({
        speaker: "ai",
        text: newQuestionText,
        isFollowUp: Boolean(nextStep.isFollowUp),
        timestamp: new Date(),
      });
    }
  }

  // Move pointer forward
  interview.currentQuestionIndex += 1;

  // 9. Complete interview if finished
  if (isCompleted) {
    interview.status = "completed";
    interview.completedAt = new Date();

    const scores = interview.questions
      .map((q) => q.score)
      .filter((s) => s !== null && s !== undefined);

    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    interview.overallScore =
      scores.length > 0 ? Number((totalScore / scores.length).toFixed(2)) : 0;

    console.log("🤖 Generating final interview feedback report...");
    const finalFeedback = await aiService.generateFinalInterviewFeedback({
      questions: interview.questions,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
    });

    interview.finalFeedback = finalFeedback;
  }

  // 10. Save interview session
  await interview.save();

  // 11. Return clean payload
  const nextQObj = interview.questions[interview.currentQuestionIndex];

  return {
    evaluation,
    completed: isCompleted,
    questionNumber: isCompleted ? interview.questions.length : interview.currentQuestionIndex + 1,
    totalQuestions: interview.numberOfQuestions,
    nextQuestion: isCompleted ? null : nextQObj?.question,
    isFollowUp: nextStep?.isFollowUp || false,
    overallScore: interview.overallScore,
    finalFeedback: isCompleted ? interview.finalFeedback : null,
  };
};

const getInterviewById = async (interviewId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new ApiError(400, "Invalid interview ID");
  }

  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
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

const getInterviewReport = async (interviewId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new ApiError(400, "Invalid interview ID");
  }

  const interview = await Interview.findOne({
    _id: interviewId,
    user: userId,
  }).populate("resume", "fileName");

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  if (interview.status !== "completed") {
    throw new ApiError(400, "Interview report is available only after completion");
  }

  return {
    interviewId: interview._id,
    resume: interview.resume,
    targetRole: interview.targetRole,
    experienceLevel: interview.experienceLevel,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    numberOfQuestions: interview.numberOfQuestions,
    durationMinutes: interview.durationMinutes,

    overallScore: interview.overallScore,
    technicalScore: interview.finalFeedback?.technicalScore ?? null,
    communicationScore: interview.finalFeedback?.communicationScore ?? null,
    problemSolvingScore: interview.finalFeedback?.problemSolvingScore ?? null,

    summary: interview.finalFeedback?.summary ?? "",
    strengths: interview.finalFeedback?.strengths ?? [],
    weaknesses: interview.finalFeedback?.weaknesses ?? [],
    recommendations: interview.finalFeedback?.recommendations ?? [],

    questions: interview.questions,
    conversationHistory: interview.conversationHistory || [],

    startedAt: interview.startedAt,
    completedAt: interview.completedAt,
  };
};

module.exports = {
  createInterview,
  startInterview,
  submitAnswer,
  getInterviewById,
  getUserInterviews,
  getInterviewReport,
};

