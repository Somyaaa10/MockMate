const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/user.model");

describe("Authentication API Endpoints", () => {
  const testUser = {
    fullName: "Test User",
    email: "testuser@example.com",
    password: "Password123!",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(testUser.email.toLowerCase());

      const dbUser = await User.findOne({ email: testUser.email.toLowerCase() });
      expect(dbUser).not.toBeNull();
      expect(dbUser.fullName).toBe(testUser.fullName);
    });

    it("should reject registration with duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "invalid@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
    });

    it("should login user successfully and return access & refresh tokens", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "WrongPassword" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject login for non-existent user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let accessToken;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      accessToken = loginRes.body.accessToken;
    });

    it("should return user profile with valid access token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    });

    it("should reject request when Authorization header is missing", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer malformed_token_here");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/refresh & /logout", () => {
    let refreshToken;
    let accessToken;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      accessToken = loginRes.body.accessToken;
      refreshToken = loginRes.body.refreshToken;
    });

    it("should refresh access token using valid refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
    });

    it("should reject refresh with missing refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should revoke refresh session on logout and reject subsequent refresh", async () => {
      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.success).toBe(false);
    });
  });

  describe("JWT Security Constraints", () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      accessToken = loginRes.body.accessToken;
      refreshToken = loginRes.body.refreshToken;
    });

    it("should sign refresh token with JWT_REFRESH_SECRET which fails verification with JWT_SECRET", () => {
      expect(() => {
        jwt.verify(refreshToken, process.env.JWT_SECRET);
      }).toThrow();

      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      expect(decodedRefresh).toBeDefined();
    });

    it("should sign access token with JWT_SECRET", () => {
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      expect(decodedAccess).toBeDefined();
    });
  });
});
