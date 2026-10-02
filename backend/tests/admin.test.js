const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user.model");

describe("Admin Authorization Middleware (requireAdmin)", () => {
  let candidateToken;
  let candidateUserId;
  let adminToken;
  let adminUserId;

  beforeEach(async () => {
    // 1. Create a candidate user
    const candRegRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Candidate User",
      email: "candidate@example.com",
      password: "Password123!",
    });
    candidateUserId = candRegRes.body.data.id;

    const candLoginRes = await request(app).post("/api/v1/auth/login").send({
      email: "candidate@example.com",
      password: "Password123!",
    });
    candidateToken = candLoginRes.body.accessToken;

    // 2. Create an admin user
    const adminRegRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
    });
    adminUserId = adminRegRes.body.data.id;

    // Promote admin user directly in MongoDB
    await User.findByIdAndUpdate(adminUserId, { role: "admin" });

    const adminLoginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });
    adminToken = adminLoginRes.body.accessToken;
  });

  describe("Protected Admin Endpoints (/api/v1/test-redis)", () => {
    it("should reject unauthenticated request with HTTP 401", async () => {
      const res = await request(app).get("/api/v1/test-redis/get");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with invalid JWT token with HTTP 401", async () => {
      const res = await request(app)
        .get("/api/v1/test-redis/get")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with expired JWT token with HTTP 401", async () => {
      const expiredToken = jwt.sign(
        { id: candidateUserId, type: "access" },
        process.env.JWT_SECRET,
        { expiresIn: "-1s" }
      );

      const res = await request(app)
        .get("/api/v1/test-redis/get")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject authenticated normal candidate user with HTTP 403", async () => {
      const res = await request(app)
        .get("/api/v1/test-redis/get")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Admin privileges required");
    });

    it("should allow authenticated admin user with HTTP 200", async () => {
      const res = await request(app)
        .get("/api/v1/test-redis/get")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should NOT allow candidate to spoof admin status via request body or headers", async () => {
      const res = await request(app)
        .post("/api/v1/test-redis/set")
        .set("Authorization", `Bearer ${candidateToken}`)
        .set("x-user-role", "admin")
        .send({ role: "admin", isAdmin: true });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Existing Candidate Functionality Regression Check", () => {
    it("should ensure candidate profile /auth/me works for candidate", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("candidate");
    });

    it("should ensure candidate profile /auth/me works for admin", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("admin");
    });
  });
});
