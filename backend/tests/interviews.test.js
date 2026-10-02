const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user.model");
const Resume = require("../models/resume.model");
const Interview = require("../models/interview.model");

describe("Interview API Endpoints", () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let sampleResumeId;

  beforeEach(async () => {
    // User 1
    const regRes1 = await request(app).post("/api/v1/auth/register").send({
      fullName: "Interview User 1",
      email: "user1@example.com",
      password: "Password123!",
    });
    user1Id = regRes1.body.data.id;
    await User.findByIdAndUpdate(user1Id, { isPremium: true });
    const loginRes1 = await request(app).post("/api/v1/auth/login").send({
      email: "user1@example.com",
      password: "Password123!",
    });
    user1Token = loginRes1.body.accessToken;

    // User 2
    const regRes2 = await request(app).post("/api/v1/auth/register").send({
      fullName: "Interview User 2",
      email: "user2@example.com",
      password: "Password123!",
    });
    user2Id = regRes2.body.data.id;
    const loginRes2 = await request(app).post("/api/v1/auth/login").send({
      email: "user2@example.com",
      password: "Password123!",
    });
    user2Token = loginRes2.body.accessToken;

    // Create Resume for User 1
    const resume = await Resume.create({
      user: user1Id,
      fileName: "sample_resume.pdf",
      fileUrl: "https://example.com/sample_resume.pdf",
      publicId: "resumes/sample_resume_123",
      extractedText: "Senior Backend Developer with 5 years experience in Node.js and MongoDB",
      skills: ["Node.js", "Express", "MongoDB"],
    });
    sampleResumeId = resume._id.toString();
  });

  describe("POST /api/v1/interviews", () => {
    it("should reject unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/v1/interviews")
        .send({
          resumeId: sampleResumeId,
          interviewType: "technical",
          numberOfQuestions: 5,
        });

      expect(res.status).toBe(401);
    });

    it("should reject creation with missing resumeId or invalid input", async () => {
      const res = await request(app)
        .post("/api/v1/interviews")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          interviewType: "technical",
          numberOfQuestions: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should successfully create an interview when authenticated with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/interviews")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          resumeId: sampleResumeId,
          interviewType: "technical",
          numberOfQuestions: 5,
          targetRole: "Backend Engineer",
          experienceLevel: "Senior",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interviewId).toBeDefined();
      expect(res.body.data.status).toBe("created");
    });
  });

  describe("GET /api/v1/interviews", () => {
    beforeEach(async () => {
      // Create 3 interviews for user 1
      for (let i = 1; i <= 3; i++) {
        await Interview.create({
          user: user1Id,
          resume: sampleResumeId,
          interviewType: "technical",
          title: `Test Interview ${i}`,
          targetRole: "Backend Engineer",
          numberOfQuestions: 5,
          status: "completed",
          questions: [{ question: "Q1", category: "Tech" }],
          conversationHistory: [{ speaker: "candidate", text: "hello" }],
        });
      }
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/v1/interviews");
      expect(res.status).toBe(401);
    });

    it("should support pagination and include metadata", async () => {
      const res = await request(app)
        .get("/api/v1/interviews?page=1&limit=2")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it("should NOT return conversationHistory or full questions array in list queries", async () => {
      const res = await request(app)
        .get("/api/v1/interviews?page=1&limit=10")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      const firstInterview = res.body.data[0];
      expect(firstInterview.conversationHistory).toBeUndefined();
      expect(firstInterview.questions).toBeUndefined();
    });

    it("should enforce maximum limit capping", async () => {
      const res = await request(app)
        .get("/api/v1/interviews?page=1&limit=100")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(50);
    });
  });

  describe("GET /api/v1/interviews/:id & /report", () => {
    let interviewId;

    beforeEach(async () => {
      const interview = await Interview.create({
        user: user1Id,
        resume: sampleResumeId,
        interviewType: "technical",
        title: "Detail Test Interview",
        targetRole: "Backend Developer",
        numberOfQuestions: 5,
        status: "completed",
        overallScore: 8,
        finalReport: { summary: "Great candidate" },
      });
      interviewId = interview._id.toString();
    });

    it("should allow authenticated owner to retrieve interview details", async () => {
      const res = await request(app)
        .get(`/api/v1/interviews/${interviewId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(interviewId);
    });

    it("should handle non-existent interview ID correctly", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/interviews/${fakeId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });

    it("should reject access if another user attempts to view someone else's interview", async () => {
      const res = await request(app)
        .get(`/api/v1/interviews/${interviewId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect([403, 404]).toContain(res.status);
    });

    it("should allow authorized user to view report and reject unauthorized user", async () => {
      const successRes = await request(app)
        .get(`/api/v1/interviews/${interviewId}/report`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(successRes.status).toBe(200);
      expect(successRes.body.success).toBe(true);

      const forbiddenRes = await request(app)
        .get(`/api/v1/interviews/${interviewId}/report`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect([403, 404]).toContain(forbiddenRes.status);
    });
  });
});
