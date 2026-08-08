const ai = require("../config/gemini");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

module.exports = {
  analyzeResume,
};
