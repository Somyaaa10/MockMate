const request = require("supertest");
const app = require("../app");
const User = require("../models/user.model");
const { generateAccessToken } = require("../utils/generateToken");
const { generateLinkCode } = require("../services/whatsappLink.service");
const { sendWhatsAppMessage } = require("../services/whatsapp.service");

// Mock external WhatsApp API service to prevent real HTTP calls
jest.mock("../services/whatsapp.service", () => ({
  sendWhatsAppMessage: jest.fn(async () => ({
    messaging_product: "whatsapp",
    messages: [{ id: "wmid.mock_message_id_12345" }],
  })),
}));

describe("WhatsApp Webhook & Integration Endpoints", () => {
  let user1;
  let user2;
  let token1;
  const verifyToken = "test_whatsapp_verify_token_123";

  beforeAll(() => {
    process.env.WHATSAPP_VERIFY_TOKEN = verifyToken;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    user1 = await User.create({
      fullName: "WhatsApp User One",
      email: "wauser1@example.com",
      password: "Password123!",
    });

    user2 = await User.create({
      fullName: "WhatsApp User Two",
      email: "wauser2@example.com",
      password: "Password123!",
    });

    token1 = generateAccessToken(user1._id);
  });

  // ==================================================
  // STEP 3: META WEBHOOK VERIFICATION (GET /api/v1/whatsapp/webhook)
  // ==================================================
  describe("GET /api/v1/whatsapp/webhook (Meta Webhook Verification)", () => {
    it("1. should succeed with valid verification token and return challenge", async () => {
      const res = await request(app)
        .get("/api/v1/whatsapp/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": verifyToken,
          "hub.challenge": "challenge_token_abc_123",
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("challenge_token_abc_123");
    });

    it("2. should reject verification with invalid token (403)", async () => {
      const res = await request(app)
        .get("/api/v1/whatsapp/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "wrong_invalid_token",
          "hub.challenge": "challenge_token_abc_123",
        });

      expect(res.statusCode).toBe(403);
    });

    it("3. should reject verification with missing parameters (403)", async () => {
      const res = await request(app).get("/api/v1/whatsapp/webhook");
      expect(res.statusCode).toBe(403);
    });
  });

  // ==================================================
  // STEP 5: VALID WEBHOOK PAYLOADS (POST /api/v1/whatsapp/webhook)
  // ==================================================
  describe("POST /api/v1/whatsapp/webhook (Incoming Webhook Processing)", () => {
    it("1. should process standard text message and send auto-reply", async () => {
      const payload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "ENTRY_ID_1",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: { display_phone_number: "1234567890", phone_number_id: "PHONE_ID" },
                  messages: [
                    {
                      from: "15551234567",
                      id: "wmid.HBgLM...",
                      timestamp: "1670000000",
                      text: { body: "Hello MockMate!" },
                      type: "text",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(
        "15551234567",
        expect.stringContaining('Hello! 👋 You said: "Hello MockMate!"')
      );
    });

    it("2. should process valid MM-XXXXXX linking code and update user whatsappPhone", async () => {
      const code = await generateLinkCode(user1._id);

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "15559876543",
                      id: "wmid.HBgLM_LINK...",
                      text: { body: code },
                      type: "text",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(
        "15559876543",
        expect.stringContaining("WhatsApp successfully connected to your MockMate account")
      );

      const updatedUser = await User.findById(user1._id);
      expect(updatedUser.whatsappPhone).toBe("15559876543");
    });

    it("3. should notify sender when linking code is invalid or expired", async () => {
      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "15559876543",
                      id: "wmid.EXPIRED...",
                      text: { body: "MM-999999" },
                      type: "text",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(
        "15559876543",
        expect.stringContaining("linking code is invalid or expired")
      );
    });

    it("4. should reject linking if WhatsApp number is already linked to another account", async () => {
      user2.whatsappPhone = "15551112222";
      await user2.save();

      const code = await generateLinkCode(user1._id);

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "15551112222",
                      id: "wmid.DUPLICATE...",
                      text: { body: code },
                      type: "text",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(sendWhatsAppMessage).toHaveBeenCalledWith(
        "15551112222",
        expect.stringContaining("already linked to another MockMate account")
      );
    });

    it("5. should handle non-text messages safely without replying", async () => {
      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "15551234567",
                      id: "wmid.IMAGE...",
                      type: "image",
                      image: { id: "img_id" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(sendWhatsAppMessage).not.toHaveBeenCalled();
    });

    it("6. should process message status updates payload cleanly", async () => {
      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  statuses: [
                    {
                      id: "wmid.STATUS123",
                      status: "delivered",
                      timestamp: "1670000100",
                      recipient_id: "15551234567",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
    });
  });

  // ==================================================
  // STEP 6 & 8: MALFORMED PAYLOADS & ERROR HANDLING
  // ==================================================
  describe("Malformed Payloads & Error Handling", () => {
    it("1. should handle empty body payload safely (200)", async () => {
      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send({});

      expect(res.statusCode).toBe(200);
    });

    it("2. should handle missing changes or value payload safely (200)", async () => {
      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send({ entry: [{}] });

      expect(res.statusCode).toBe(200);
    });

    it("3. should handle sendWhatsAppMessage error gracefully without crashing server", async () => {
      sendWhatsAppMessage.mockImplementationOnce(async () => {
        throw new Error("Meta API 500 Internal Server Error");
      });

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "15551234567",
                      id: "wmid.FAIL...",
                      text: { body: "Hello" },
                      type: "text",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload);

      expect(res.statusCode).toBe(200);
    });
  });

  // ==================================================
  // LINK CODE GENERATION ENDPOINT (POST /api/v1/whatsapp/link)
  // ==================================================
  describe("POST /api/v1/whatsapp/link (Generate Link Code)", () => {
    it("1. should generate a 6-digit MM-XXXXXX link code for authenticated user", async () => {
      const res = await request(app)
        .post("/api/v1/whatsapp/link")
        .set("Authorization", `Bearer ${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toMatch(/^MM-\d{6}$/);
      expect(res.body.expiresIn).toBe(600);
    });

    it("2. should reject unauthenticated link code generation request (401)", async () => {
      const res = await request(app).post("/api/v1/whatsapp/link");
      expect(res.statusCode).toBe(401);
    });
  });
});
