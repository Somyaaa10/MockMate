const ai = require("../config/gemini");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// analyzes resume
const analyzeResume = async (resumeText) => {
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

const generateFinalInterviewFeedback = async ({
  questions,
  interviewType,
  difficulty,
}) => {
  const answeredQuestions = questions.filter(
    (question) =>
      question.answer && question.answer.trim() && question.score !== null,
  );

  const interviewData = answeredQuestions.map((question, index) => ({
    questionNumber: index + 1,
    question: question.question,
    answer: question.answer,
    score: question.score,
    feedback: question.feedback,
    strengths: question.strengths,
    improvements: question.improvements,
  }));

  const prompt = `
You are an expert technical interviewer.

Analyze the following completed mock interview.

Interview Type:
${interviewType}

Difficulty:
${difficulty}

Interview responses:

${JSON.stringify(interviewData, null, 2)}

Generate a final interview performance report.

Evaluate:

1. Overall candidate performance.
2. Technical knowledge.
3. Communication quality based ONLY on the candidate's answers.
4. Strengths.
5. Weaknesses.
6. Specific recommendations.

Return only valid JSON.

Do not invent experience or skills.

The scores must be between 0 and 10.

Use this exact structure:

{
  "summary": "Overall assessment of the candidate",
  "technicalScore": 0,
  "communicationScore": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}
`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🤖 Final interview feedback attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        // Use the same model that already works in your project
        model: "gemini-3.1-flash-lite",

        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              summary: {
                type: "string",
              },

              technicalScore: {
                type: "number",
              },

              communicationScore: {
                type: "number",
              },

              problemSolvingScore: {
                type: "number",
              },

              strengths: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              weaknesses: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              recommendations: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },

            required: [
              "summary",
              "technicalScore",
              "communicationScore",
              "problemSolvingScore",
              "strengths",
              "weaknesses",
              "recommendations",
            ],
          },
        },
      });

      const result = JSON.parse(response.text);

      // Basic validation
      if (
        !result.summary ||
        typeof result.technicalScore !== "number" ||
        typeof result.communicationScore !== "number"
      ) {
        throw new Error("Invalid final interview feedback from Gemini");
      }

      if (typeof result.problemSolvingScore !== "number") {
        result.problemSolvingScore = Math.round(
          (result.technicalScore + result.communicationScore) / 2
        );
      }

      return result;
    } catch (error) {
      lastError = error;

      const code = error?.code || error?.error?.code;

      const status = error?.status || error?.error?.status;

      console.error(
        `❌ Final feedback attempt ${attempt} failed:`,
        code || status || error.message,
      );

      // Retry temporary Gemini availability problems
      if (code !== 503 && status !== "UNAVAILABLE") {
        throw error;
      }

      if (attempt < 3) {
        const delay = attempt * 2000;

        console.log(`⏳ Retrying final feedback in ${delay}ms...`);

        await sleep(delay);
      }
    }
  }

  throw lastError;
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
  const prompt = `
You are a warm, highly professional human AI recruiter conducting a live mock interview for MockMate.

Candidate Name: ${candidateName || "Candidate"}
Target Role: ${targetRole || "Full Stack Developer"}
Interview Type: ${interviewType || "technical"}
Difficulty Level: ${difficulty || "medium"}

Candidate Resume Snippet:
${resumeText ? resumeText.substring(0, 800) : "No resume text attached."}

Generate a concise, welcoming greeting message (2 sentences) introducing yourself as the MockMate AI interviewer and setting a positive tone. Also generate a strong opening question related to their experience or target role.

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
      greeting: `Hello ${candidateName || "Candidate"}, welcome to your MockMate ${interviewType} mock interview for the ${targetRole || "Software Developer"} position. I'm excited to speak with you today.`,
      firstQuestion: `To start off, please introduce yourself and tell me about a project you recently worked on.`,
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
  lastEvaluation,
  questionNumber,
  totalQuestions,
  candidateContext = {},
}) => {
  const prompt = `
You are an expert technical recruiter and AI interviewer conducting an adaptive real-time mock interview.

Target Role: ${targetRole || "Full Stack Developer"}
Experience Level: ${experienceLevel || "Mid Level"}
Interview Type: ${interviewType || "technical"}
Current Difficulty: ${currentDifficulty || "medium"}
Progress: Question ${questionNumber} of ${totalQuestions}

Candidate Resume Text:
${resumeText ? resumeText.substring(0, 1200) : "N/A"}

Candidate Specific Projects & Skills Context:
${JSON.stringify(candidateContext, null, 2)}

Recent Conversation History:
${JSON.stringify(conversationHistory.slice(-6), null, 2)}

Candidate's Latest Answer:
"${lastAnswer || ""}"

Latest Evaluation Score: ${lastEvaluation?.score ?? 7}/10
Correctness: ${lastEvaluation?.correctness || "good"}
Missing Concepts: ${JSON.stringify(lastEvaluation?.missingConcepts || [])}

ADAPTIVE DECISION RULES:
1. If candidate's last answer was weak/inaccurate or missed key concepts -> set nextAction="FOLLOW_UP" or "EASIER" and ask a clarifying question about that specific concept.
2. If candidate's last answer was strong & high score -> set nextAction="HARDER" or "NEW_TOPIC" and increase difficulty or ask deeper architectural/trade-off questions.
3. If candidate listed specific projects in their resume (e.g. "Hospital Management System" or "E-commerce platform") -> set nextAction="PROJECT_QUESTION" and ask a question specifically addressing how they designed or built that project!
4. Never repeat questions already present in conversation history.
5. If questionNumber >= totalQuestions, set nextAction="END_INTERVIEW" and shouldEndInterview=true.

Return JSON:
{
  "nextAction": "FOLLOW_UP" | "HARDER" | "EASIER" | "NEW_TOPIC" | "PROJECT_QUESTION" | "END_INTERVIEW",
  "nextQuestion": "The text of the next question",
  "isFollowUp": true/false,
  "topic": "Topic category (e.g. React, Node.js, MongoDB, System Design)",
  "suggestedDifficulty": "easy" | "medium" | "hard",
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
            topic: { type: "string" },
            suggestedDifficulty: { type: "string" },
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
      nextQuestion: "Can you elaborate on how you handled state management and error boundaries in that application?",
      isFollowUp: true,
      topic: "System Architecture",
      suggestedDifficulty: currentDifficulty || "medium",
      shouldEndInterview: false,
      interviewerNote: "Fallback follow-up question",
    };
  }
};


module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalInterviewFeedback,
  generateGreeting,
  generateNextDynamicStep,
};
