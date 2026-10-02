process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_access_jwt_secret_32_chars_min_length!!";
process.env.JWT_REFRESH_SECRET = "test_refresh_jwt_secret_32_chars_min_length!!";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.RAZORPAY_KEY_ID = "rzp_test_mockkeyid123";
process.env.RAZORPAY_KEY_SECRET = "mock_razorpay_secret_12345";
process.env.RAZORPAY_WEBHOOK_SECRET = "mock_webhook_secret_12345";
process.env.GEMINI_API_KEY = "mock_gemini_api_key";

const mongoose = require("mongoose");
let mongoServer;

// Mock Redis Service in memory for testing (prefixed with 'mock' for Jest scope rule)
const mockRedisStore = new Map();
let mockIsRedisAvailable = true;

jest.mock("../services/redis.service", () => ({
  setCache: jest.fn(async (key, value, expirySeconds = 3600) => {
    if (!mockIsRedisAvailable) return false;
    mockRedisStore.set(key, JSON.stringify(value));
    return true;
  }),
  getCache: jest.fn(async (key) => {
    if (!mockIsRedisAvailable) return null;
    const val = mockRedisStore.get(key);
    return val ? JSON.parse(val) : null;
  }),
  deleteCache: jest.fn(async (key) => {
    if (!mockIsRedisAvailable) return false;
    mockRedisStore.delete(key);
    return true;
  }),
  setNxCache: jest.fn(async (key, value = "1", expirySeconds = 86400) => {
    if (!mockIsRedisAvailable) {
      throw new Error("Redis client is not ready");
    }
    if (mockRedisStore.has(key)) {
      return false; // Already exists
    }
    mockRedisStore.set(key, typeof value === "string" ? value : JSON.stringify(value));
    return true;
  }),
  // Helper methods exported for test manipulation
  __resetRedisStore: () => mockRedisStore.clear(),
  __setRedisAvailable: (status) => { mockIsRedisAvailable = status; },
  __getRedisStore: () => mockRedisStore,
}));

// Mock Email Service (SMTP)
jest.mock("../services/email.service", () => ({
  sendVerificationEmail: jest.fn(async () => true),
  sendPasswordResetEmail: jest.fn(async () => true),
  logSmtpDiagnostics: jest.fn(),
}));

// Mock Gemini AI Service
jest.mock("../services/ai.service", () => ({
  generateInterviewQuestions: jest.fn(async () => [
    { question: "Tell me about yourself", category: "Behavioral" },
    { question: "What is your biggest strength?", category: "Behavioral" },
  ]),
  evaluateInterviewResponse: jest.fn(async () => ({
    score: 8,
    feedback: "Great response!",
  })),
  generateFullInterviewReport: jest.fn(async () => ({
    overallScore: 8,
    summary: "Strong performance overall",
  })),
  generateFinalInterviewFeedback: jest.fn(async () => ({
    overallScore: 8,
    summary: "Great candidate",
    technicalScore: 8,
    communicationScore: 8,
    problemSolvingScore: 8,
    strengths: ["Coding"],
    weaknesses: ["None"],
    recommendations: ["Keep going"],
  })),
  generateGreeting: jest.fn(async () => "Hello, welcome to your interview!"),
}));

// Setup Mongo Memory Server or Test DB
beforeAll(async () => {
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (err) {
    const fallbackUri = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/mockmate_test";
    await mongoose.connect(fallbackUri);
  }
});

afterEach(async () => {
  mockRedisStore.clear();
  mockIsRedisAvailable = true;
  if (mongoose.connection && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
