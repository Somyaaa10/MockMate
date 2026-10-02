const request = require("supertest");
const crypto = require("crypto");
const app = require("../app");
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");

// Access helper from Redis mock in setup.js
const { __getRedisStore, __setRedisAvailable } = require("../services/redis.service");

describe("Subscription & Razorpay Webhook API Endpoints", () => {
  let userToken;
  let userId;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret_12345";

  beforeEach(async () => {
    const regRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Sub User",
      email: "subuser@example.com",
      password: "Password123!",
    });
    userId = regRes.body.data.id;

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "subuser@example.com",
      password: "Password123!",
    });
    userToken = loginRes.body.accessToken;
  });

  describe("POST /api/v1/subscriptions/create", () => {
    it("should reject unauthenticated creation request", async () => {
      const res = await request(app).post("/api/v1/subscriptions/create");
      expect(res.status).toBe(401);
    });

    it("should create subscription/order for authenticated user", async () => {
      const res = await request(app)
        .post("/api/v1/subscriptions/create")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("POST /api/v1/subscriptions/verify", () => {
    it("should reject verification with missing details", async () => {
      const res = await request(app)
        .post("/api/v1/subscriptions/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid payment signature", async () => {
      const res = await request(app)
        .post("/api/v1/subscriptions/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          razorpayPaymentId: "pay_real_123",
          razorpayOrderId: "order_real_123",
          razorpaySignature: "invalid_signature",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should accept valid payment verification with mock order/signature", async () => {
      const res = await request(app)
        .post("/api/v1/subscriptions/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          razorpayPaymentId: "pay_mock_123",
          razorpayOrderId: "order_mock_123",
          razorpaySignature: "mock_signature",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("active");
    });
  });

  describe("POST /api/v1/subscriptions/webhook", () => {
    const createSignedPayload = (payloadObj) => {
      const payloadString = JSON.stringify(payloadObj);
      const signature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payloadString)
        .digest("hex");
      return { payloadString, signature };
    };

    it("1. Valid signature + new event should process once and set Redis key", async () => {
      const eventPayload = {
        event_id: "evt_test_001",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_001",
              order_id: "order_mock_001",
              amount: 290000,
              currency: "INR",
              status: "captured",
            },
          },
        },
      };

      const { payloadString, signature } = createSignedPayload(eventPayload);

      const res = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const redisStore = __getRedisStore();
      expect(redisStore.has("razorpay:webhook:evt_test_001")).toBe(true);
    });

    it("2. Duplicate event should be ignored without processing again", async () => {
      const eventPayload = {
        event_id: "evt_test_dup",
        event: "payment.captured",
        payload: {
          payment: {
            entity: { id: "pay_test_dup" },
          },
        },
      };

      const { payloadString, signature } = createSignedPayload(eventPayload);

      // Send first time
      const firstRes = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(firstRes.status).toBe(200);

      // Send second time (duplicate)
      const secondRes = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.duplicate).toBe(true);
    });

    it("3. Invalid signature should be rejected and NOT create Redis deduplication key", async () => {
      const eventPayload = {
        event_id: "evt_test_invalid_sig",
        event: "payment.captured",
      };

      const payloadString = JSON.stringify(eventPayload);
      const invalidSignature = "invalid_hmac_signature";

      const res = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", invalidSignature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(res.status).toBe(400);

      const redisStore = __getRedisStore();
      expect(redisStore.has("razorpay:webhook:evt_test_invalid_sig")).toBe(false);
    });

    it("4. Webhook with missing event ID should be handled safely", async () => {
      const eventPayload = {
        event: "payment.captured",
      };

      const { payloadString, signature } = createSignedPayload(eventPayload);

      const res = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("5. Processing failure should remove Redis key so event can retry", async () => {
      // Mock Subscription.findOne to throw an unexpected database error
      const findOneSpy = jest.spyOn(Subscription, "findOne").mockRejectedValueOnce(new Error("Simulated database failure"));

      const eventPayload = {
        event_id: "evt_test_fail_retry",
        event: "subscription.activated",
        payload: {
          subscription: {
            entity: { id: "sub_test_retry" },
          },
        },
      };

      const { payloadString, signature } = createSignedPayload(eventPayload);

      const res = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(res.status).toBe(500);

      const redisStore = __getRedisStore();
      expect(redisStore.has("razorpay:webhook:evt_test_fail_retry")).toBe(false);

      findOneSpy.mockRestore();
    });

    it("6. Redis unavailable should fail safely with 503 service unavailable", async () => {
      __setRedisAvailable(false);

      const eventPayload = {
        event_id: "evt_test_redis_down",
        event: "payment.captured",
      };

      const { payloadString, signature } = createSignedPayload(eventPayload);

      const res = await request(app)
        .post("/api/v1/subscriptions/webhook")
        .set("x-razorpay-signature", signature)
        .set("Content-Type", "application/json")
        .send(payloadString);

      expect(res.status).toBe(503);
      expect(res.body.message).toContain("Webhook deduplication service unavailable");
    });
  });
});
