const ai = require("../config/gemini");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// analyzes resume
const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert ATS resume analyzer and technical recruiter.

Analyze the following resume carefully.

Evaluate:
1. ATS score from 0 to 100.
2. Technical and professional skills explicitly present.
3. Important skills missing for a modern software engineering candidate.
4. Resume strengths.
5. Resume weaknesses.
6. Specific actionable suggestions.
7. Technical interview questions based on the candidate's actual experience.

Important rules:
- Do not invent experience that is not present.
- Only list skills supported by the resume.
- Missing skills should be relevant to the candidate's current profile.
- Suggestions should be practical and specific.
- Interview questions should be based on technologies, projects, education, and experience found in the resume.
- Return only the requested structured JSON.

RESUME:
${resumeText}
`;

  const config = {
    responseMimeType: "application/json",

    responseSchema: {
      type: "object",

      properties: {
        atsScore: {
          type: "integer",
        },

        skills: {
          type: "array",
          items: {
            type: "string",
          },
        },

        missingSkills: {
          type: "array",
          items: {
            type: "string",
          },
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

        suggestions: {
          type: "array",
          items: {
            type: "string",
          },
        },

        interviewQuestions: {
          type: "array",
          items: {
            type: "string",
          },
        },
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

      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;

      const status = error?.status || error?.error?.status;

      const code = error?.code || error?.error?.code;

      console.error(
        `❌ Gemini attempt ${attempt} failed:`,
        code || status || error.message,
      );

      // Retry only temporary availability errors
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
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Interview type:
${interviewType}

Difficulty:
${difficulty}

Question:
${question}

Candidate Answer:
${answer}

Candidate Resume:
${resumeText}

Evaluate:
1. Score from 0 to 10.
2. Technical accuracy.
3. Quality of explanation.
4. Strengths.
5. Improvements.
6. Specific feedback.

Rules:
- Evaluate only what the candidate actually answered.
- Do not invent information.
- Be fair and concise.
- Consider the candidate's resume when judging their experience.
- Return only JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",

        properties: {
          score: {
            type: "integer",
            description: "Score from 0 to 10",
          },

          feedback: {
            type: "string",
          },

          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },

          improvements: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: ["score", "feedback", "strengths", "improvements"],
      },
    },
  });

  return JSON.parse(response.text);
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

module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalInterviewFeedback,
};
