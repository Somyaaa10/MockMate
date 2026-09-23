const axios = require("axios");
const FormData = require("form-data");

const API_BASE = "http://localhost:5000/api/v1";

async function testVoiceInterviewE2E() {
  console.log("--- STARTING VOICE AI INTERVIEW E2E API VERIFICATION ---");

  let token = "";
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "test_redis@example.com",
      password: "password123",
    });
    token = loginRes.data.token;
    console.log("✅ Auth login successful");
  } catch (err) {
    console.error("Auth login failed:", err.message);
    process.exit(1);
  }

  // 1. Fetch user's resumes or upload dummy resume
  let resumeId = "";
  try {
    const resumesRes = await axios.get(`${API_BASE}/resumes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resumes = resumesRes.data.data;
    if (resumes && resumes.length > 0) {
      resumeId = resumes[0]._id;
      console.log(`✅ Existing resume found: ${resumeId}`);
    } else {
      const dummyPdfBuffer = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n00000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
      );

      const form = new FormData();
      form.append("resume", dummyPdfBuffer, {
        filename: "test_resume.pdf",
        contentType: "application/pdf",
      });

      const uploadRes = await axios.post(`${API_BASE}/resumes/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders(),
        },
      });
      resumeId = uploadRes.data.data._id;
      console.log(`✅ Resume uploaded successfully: ${resumeId}`);
    }
  } catch (err) {
    console.error("Failed handling resume:", err.response?.data || err.message);
    process.exit(1);
  }

  // 2. Create Interview
  let interviewId = "";
  try {
    const createRes = await axios.post(
      `${API_BASE}/interviews`,
      {
        resumeId,
        interviewType: "technical",
        difficulty: "medium",
        numberOfQuestions: 2,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const createdData = createRes.data.data;
    interviewId = createdData._id || createdData.id || createdData.interviewId;
    console.log(`✅ Interview created successfully: ${interviewId}`);
  } catch (err) {
    console.error("Interview creation failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 3. Start Interview
  let firstQuestion = "";
  try {
    const startRes = await axios.post(
      `${API_BASE}/interviews/${interviewId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    firstQuestion = startRes.data.data.question;
    console.log(`✅ Interview started! First Question: "${firstQuestion}"`);
  } catch (err) {
    console.error("Interview start failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 4. Test Session Recovery (GET /api/v1/interviews/:id)
  try {
    const sessionRes = await axios.get(`${API_BASE}/interviews/${interviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessionData = sessionRes.data.data;
    console.log(`✅ Session recovery verified: Status=${sessionData.status}, CurrentQIndex=${sessionData.currentQuestionIndex}`);
  } catch (err) {
    console.error("Session recovery failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 5. Submit Verbal Answer for Question 1
  try {
    const ansRes = await axios.post(
      `${API_BASE}/interviews/${interviewId}/answer`,
      {
        answer: "I have extensive experience building scalable MERN stack web applications using React for dynamic UI and Node.js for backend services.",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const ansData = ansRes.data.data;
    console.log(`✅ Verbal answer 1 evaluated! Score: ${ansData.evaluation.score}/10, Completed: ${ansData.completed}`);
  } catch (err) {
    console.error("Answer 1 submission failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 6. Submit Verbal Answer for Question 2 (Completion)
  try {
    const ansRes2 = await axios.post(
      `${API_BASE}/interviews/${interviewId}/answer`,
      {
        answer: "I utilize MongoDB indexes, projection, and lean queries to optimize database queries for high throughput.",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const ansData2 = ansRes2.data.data;
    console.log(`✅ Verbal answer 2 evaluated! Score: ${ansData2.evaluation.score}/10, Completed: ${ansData2.completed}`);
  } catch (err) {
    console.error("Answer 2 submission failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 7. Verify Final Report API (GET /api/v1/interviews/:id/report)
  try {
    const reportRes = await axios.get(`${API_BASE}/interviews/${interviewId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const reportData = reportRes.data.data;
    console.log(`✅ Final Report API verified! Overall Score: ${reportData.overallScore}/10`);
  } catch (err) {
    console.error("Report API failed:", err.response?.data || err.message);
    process.exit(1);
  }

  console.log("--- ALL VOICE AI INTERVIEW APIs VERIFIED SUCCESSFULLY ---");
}

testVoiceInterviewE2E();
