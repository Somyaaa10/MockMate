const ai = require("../config/gemini");
const ApiError = require("../utils/ApiError");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Validates whether the document text is actually a candidate resume/CV
const validateIsResume = async (resumeText) => {
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      isResume: false,
      rejectionReason: "The uploaded document contains insufficient text to be analyzed as a resume.",
    };
  }

  const prompt = `
You are an expert ATS document classification engine.

Analyze the following text extracted from a user's uploaded document and determine if it is a legitimate candidate resume or CV.

A LEGITIMATE RESUME/CV MUST:
- Describe a candidate's background, work experience, technical/soft skills, education, projects, certifications, or professional contact details.

DOCUMENTS THAT ARE NOT RESUMES (MUST BE REJECTED):
- Essays, articles, research papers, assignment answers, storybooks, recipes
- Invoices, billing statements, purchase orders, receipts, financial spreadsheets
- Software user manuals, API documentation, raw source code repositories
- Legal contracts, privacy policies, terms of service
- Random text, filler words, lorem ipsum, generic non-resume certificates

Respond ONLY in structured JSON with:
{
  "isResume": true | false,
  "rejectionReason": "Clear, polite error message explaining why the document is not a resume (if isResume is false), otherwise empty string"
}

DOCUMENT TEXT:
${resumeText.substring(0, 3000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            isResume: { type: "boolean" },
            rejectionReason: { type: "string" },
          },
          required: ["isResume"],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.warn("⚠️ AI resume validation warning, fallback heuristic:", err.message);
    const textLower = resumeText.toLowerCase();
    const resumeKeywords = [
      "experience",
      "education",
      "skills",
      "projects",
      "work",
      "university",
      "college",
      "degree",
      "summary",
      "contact",
      "email",
      "phone",
      "curriculum vitae",
      "resume",
      "cv",
    ];
    const count = resumeKeywords.filter((kw) => textLower.includes(kw)).length;
    if (count < 2) {
      return {
        isResume: false,
        rejectionReason:
          "The uploaded document does not appear to be a candidate resume or CV. Please upload a legitimate resume.",
      };
    }
    return { isResume: true, rejectionReason: "" };
  }
};

// analyzes resume
const analyzeResume = async (resumeText) => {
  const validation = await validateIsResume(resumeText);
  if (!validation.isResume) {
    throw new ApiError(
      400,
      validation.rejectionReason ||
        "The uploaded document is not a valid resume/CV. Please upload a legitimate resume file.",
    );
  }

  const prompt = `
You are an expert ATS resume analyzer and senior technical recruiter.

Analyze the following resume carefully.

Extract and evaluate:
1. ATS score from 0 to 100.
2. Candidate contact information (Name, Email, Phone) if present.
3. Explicit technical skills and soft skills.
4. Important missing skills for the candidate's domain.
5. Key strengths and weaknesses.
6. Practical actionable suggestions for resume improvement.
7. Technical interview questions based on actual projects/work experience.
8. Work experience list (company, role, duration, description).
9. Projects list (title, description, technologies).
10. Education (degree, institution, year).
11. Certifications list.
12. Recommended interview topics and difficulty ("easy" | "medium" | "hard").

Important rules:
- Do not invent experience or skills not supported by the resume.
- Missing skills should be relevant to the candidate's profile.
- Return only valid structured JSON.

RESUME:
${resumeText}
`;

  const config = {
    responseMimeType: "application/json",

    responseSchema: {
      type: "object",
      properties: {
        atsScore: { type: "integer" },
        candidateName: { type: "string" },
        candidateEmail: { type: "string" },
        candidatePhone: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        technicalSkills: { type: "array", items: { type: "string" } },
        softSkills: { type: "array", items: { type: "string" } },
        missingSkills: { type: "array", items: { type: "string" } },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        suggestions: { type: "array", items: { type: "string" } },
        interviewQuestions: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              role: { type: "string" },
              duration: { type: "string" },
              description: { type: "string" },
            },
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              technologies: { type: "array", items: { type: "string" } },
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              institution: { type: "string" },
              year: { type: "string" },
            },
          },
        },
        certifications: { type: "array", items: { type: "string" } },
        recommendedTopics: { type: "array", items: { type: "string" } },
        recommendedDifficulty: { type: "string" },
      },
      required: [
        "atsScore",
        "skills",
        "missingSkills",
        "strengths",
        "weaknesses",
        "suggestions",
        "interviewQuestions",
      ],
    },
  };

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🤖 Gemini attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config,
      });

      const parsed = JSON.parse(response.text);
      if (!parsed || typeof parsed.atsScore !== "number") {
        throw new Error("Invalid structure returned by Gemini for resume analysis");
      }

      return parsed;

      return parsed;
    } catch (error) {
      lastError = error;

      const status = error?.status || error?.error?.status;
      const code = error?.code || error?.error?.code;

      console.error(
        `❌ Gemini attempt ${attempt} failed:`,
        code || status || error.message,
      );

      if (code !== 503 && status !== "UNAVAILABLE") {
        throw error;
      }

      if (attempt < 3) {
        const delay = attempt * 2000;
        console.log(`⏳ Retrying Gemini in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};


// generate interview question
const generateInterviewQuestions = async ({
  resumeText,
  interviewType,
  difficulty,
  numberOfQuestions,
}) => {
  const prompt = `
You are an expert technical interviewer.

Create a personalized mock interview based on the candidate's resume.

Interview type:
${interviewType}

Difficulty:
${difficulty}

Number of questions:
${numberOfQuestions}

Rules:
- Questions must be based on the candidate's actual resume.
- Do not invent technologies or experience.
- For technical interviews, ask questions about the candidate's actual technologies and projects.
- For HR interviews, ask questions relevant to the candidate's experience.
- For behavioral interviews, create realistic behavioral questions.
- Questions should progressively become more challenging.
- Do not provide answers.
- Return only JSON.

RESUME:
${resumeText}
`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Interview question generation attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              questions: {
                type: "array",

                items: {
                  type: "string",
                },
              },
            },

            required: ["questions"],
          },
        },
      });

      const result = JSON.parse(response.text);

      if (
        !result.questions ||
        !Array.isArray(result.questions) ||
        result.questions.length === 0
      ) {
        throw new Error("Gemini returned no interview questions");
      }

      return result.questions.slice(0, numberOfQuestions);
    } catch (error) {
      lastError = error;

      console.error(
        `Interview generation attempt ${attempt} failed:`,
        error.message,
      );

      const code = error?.code || error?.error?.code;

      const status = error?.status || error?.error?.status;

      if (code !== 503 && status !== "UNAVAILABLE") {
        throw error;
      }

      if (attempt < 3) {
        const delay = attempt * 2000;

        console.log(`Retrying in ${delay}ms...`);

        await sleep(delay);
      }
    }
  }

  throw lastError;
};

const evaluateInterviewAnswer = async ({
  question,
  answer,
  resumeText,
  interviewType,
  difficulty,
}) => {
  const prompt = `
You are an expert technical interviewer evaluating a live candidate answer.

Interview type: ${interviewType}
Difficulty level: ${difficulty}

Question:
"${question}"

Candidate's Spoken Answer:
"${answer}"

Candidate Resume Text:
${resumeText ? resumeText.substring(0, 1000) : "N/A"}

Evaluate thoroughly:
1. Technical accuracy and correctness ("excellent" | "good" | "fair" | "poor").
2. Technical Score (0 to 10).
3. Communication Score (0 to 10).
4. Confidence Score (0 to 10).
5. Overall score (0 to 10).
6. Key strengths in the answer.
7. Weaknesses / areas to improve.
8. Specific missing technical concepts.
9. Constructive concise feedback (2-3 sentences).

Return structured JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",
        properties: {
          score: { type: "integer", description: "Score from 0 to 10" },
          technicalScore: { type: "integer" },
          communicationScore: { type: "integer" },
          confidenceScore: { type: "integer" },
          correctness: { type: "string" },
          feedback: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          missingConcepts: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
        },
        required: ["score", "feedback", "strengths"],
      },
    },
  });

  const result = JSON.parse(response.text);
  if (!result.improvements) result.improvements = result.weaknesses || [];
  if (!result.technicalScore) result.technicalScore = result.score || 7;
  if (!result.communicationScore) result.communicationScore = result.score || 7;
  if (!result.confidenceScore) result.confidenceScore = result.score || 7;

  return result;
};

// -------------------------------------------------------------
// Real-Time Interviewer: AI Greeting Generation
// -------------------------------------------------------------
const generateGreeting = async ({
  candidateName,
  targetRole,
  interviewType,
  difficulty,
  resumeText,
}) => {
  const currentHour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = "Good afternoon";
  } else if (currentHour >= 17) {
    timeGreeting = "Good evening";
  }

  const name = candidateName || "Candidate";
  const role = targetRole || "Full Stack Developer";

  const prompt = `
You are a warm, highly professional human AI recruiter conducting a live mock interview for MockMate.

Candidate Name: ${name}
Target Role: ${role}
Interview Type: ${interviewType || "technical"}
Difficulty Level: ${difficulty || "medium"}

Candidate Resume Snippet:
${resumeText ? resumeText.substring(0, 800) : "No resume text attached."}

INSTRUCTIONS:
1. Start greeting with exact time-based greeting: "${timeGreeting}, ${name}."
2. Followed by: "Welcome to your MockMate interview. I'll be conducting your ${role} interview today."
3. First question should be a natural opening question: "Let's begin with a simple introduction. Could you tell me about yourself?"

Return valid JSON with keys "greeting" and "firstQuestion".
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            firstQuestion: { type: "string" },
          },
          required: ["greeting", "firstQuestion"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.warn("⚠️ Falling back to default AI greeting due to error:", error.message);
    return {
      greeting: `${timeGreeting}, ${name}. Welcome to your MockMate interview. I'll be conducting your ${role} interview today.`,
      firstQuestion: `Let's begin with a simple introduction. Could you tell me about yourself?`,
    };
  }
};

// -------------------------------------------------------------
// Real-Time Interviewer: Dynamic Question & Follow-Up Generation
// -------------------------------------------------------------
const generateNextDynamicStep = async ({
  resumeText,
  targetRole,
  experienceLevel,
  interviewType,
  currentDifficulty,
  conversationHistory = [],
  lastAnswer,
  questionNumber,
  totalQuestions,
  candidateName,
  candidateContext = {},
}) => {
  const name = candidateName || "Candidate";

  const prompt = `
You are an expert human-like technical interviewer conducting an adaptive live mock interview.

Target Role: ${targetRole || "Full Stack Developer"}
Experience Level: ${experienceLevel || "Mid Level"}
Interview Type: ${interviewType || "technical"}
Current Difficulty: ${currentDifficulty || "medium"}
Progress: Question ${questionNumber} of ${totalQuestions}
Candidate Name: ${name}

Candidate Resume Text:
${resumeText ? resumeText.substring(0, 1200) : "N/A"}

Candidate Specific Projects & Skills Context:
${JSON.stringify(candidateContext, null, 2)}

Recent Conversation History:
${JSON.stringify(conversationHistory.slice(-8), null, 2)}

Candidate's Latest Answer:
"${lastAnswer || ""}"

CRITICAL REAL HUMAN INTERVIEWER RULES:
1. NO EVALUATION OR GRADING. NEVER mention scores, grades, ratings, performance, "good answer", "weak answer", "correct", or "incorrect".
2. Respond naturally like a real interviewer before asking the next question:
   - Use natural acknowledgments: "Thank you, ${name}.", "Got it.", "Understood.", "That's interesting.", "I see."
   - If the candidate mentioned specific technologies or projects in their answer (e.g. Redis, WebRTC, microservices), ask an adaptive follow-up about that!
   - If answer is unclear or too short, ask naturally: "Could you explain that a little more?" or "Could you give me a little more detail about that?"
   - If candidate says "I don't know", say: "That's okay. Let me move to another topic."
   - Ask about projects, experience, architecture, challenges, and problem solving from their resume context.
3. If questionNumber > totalQuestions, set nextAction="END_INTERVIEW", shouldEndInterview=true, and set nextQuestion to:
   "Thank you, ${name}. That concludes our interview. I appreciate your time. Your interview report is now being prepared."

Return JSON:
{
  "nextAction": "FOLLOW_UP" | "PROJECT_QUESTION" | "NEW_TOPIC" | "CLARIFICATION" | "END_INTERVIEW",
  "nextQuestion": "The complete natural response and next question text",
  "isFollowUp": true/false,
  "shouldEndInterview": true/false,
  "interviewerNote": "Short explanation of rationale"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            nextAction: { type: "string" },
            nextQuestion: { type: "string" },
            isFollowUp: { type: "boolean" },
            shouldEndInterview: { type: "boolean" },
            interviewerNote: { type: "string" },
          },
          required: ["nextAction", "nextQuestion", "isFollowUp", "shouldEndInterview"],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    if (!parsed.nextAction) parsed.nextAction = parsed.isFollowUp ? "FOLLOW_UP" : "NEW_TOPIC";
    return parsed;
  } catch (error) {
    console.warn("⚠️ Error generating dynamic next step, falling back:", error.message);
    return {
      nextAction: "FOLLOW_UP",
      nextQuestion: "Thank you. Could you elaborate a bit more on the key architecture decisions you made for that project?",
      isFollowUp: true,
      shouldEndInterview: false,
      interviewerNote: "Fallback natural follow-up question",
    };
  }
};

const generateFinalInterviewFeedback = async ({
  conversationHistory = [],
  questions = [],
  resumeText = "",
  targetRole = "Software Developer",
  interviewType = "technical",
  difficulty = "medium",
  candidateName = "Candidate",
}) => {
  const prompt = `
You are a senior technical interviewer and recruiting manager.

Analyze the complete transcript of the mock interview that just finished.

Candidate Name: ${candidateName}
Target Role: ${targetRole}
Interview Type: ${interviewType}
Difficulty: ${difficulty}

Candidate Resume Context:
${resumeText ? resumeText.substring(0, 1500) : "N/A"}

Full Interview Conversation Transcript:
${JSON.stringify(conversationHistory.length > 0 ? conversationHistory : questions, null, 2)}

Generate a comprehensive final interview performance report based on the ENTIRE conversation.

Evaluate:
1. Overall Score (0 to 10 scale).
2. Technical Score (0 to 10 scale).
3. Communication Score (0 to 10 scale).
4. Problem Solving Score (0 to 10 scale).
5. Executive Summary of overall candidate performance.
6. Strengths observed across all candidate responses.
7. Weaknesses / Areas needing improvement.
8. Specific actionable recommendations.

Return valid JSON:
{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "problemSolvingScore": 0,
  "summary": "Overall assessment...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."]
}
`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🤖 Final interview feedback attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              overallScore: { type: "number" },
              technicalScore: { type: "number" },
              communicationScore: { type: "number" },
              problemSolvingScore: { type: "number" },
              summary: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
            },
            required: [
              "overallScore",
              "technicalScore",
              "communicationScore",
              "problemSolvingScore",
              "summary",
              "strengths",
              "weaknesses",
              "recommendations",
            ],
          },
        },
      });

      const result = JSON.parse(response.text);
      if (!result.summary || typeof result.technicalScore !== "number") {
        throw new Error("Invalid final interview feedback from Gemini");
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Final feedback attempt ${attempt} failed:`, error.message);
      if (attempt < 3) await sleep(attempt * 2000);
    }
  }

  throw lastError;
};

module.exports = {
  validateIsResume,
  analyzeResume,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalInterviewFeedback,
  generateGreeting,
  generateNextDynamicStep,
};

