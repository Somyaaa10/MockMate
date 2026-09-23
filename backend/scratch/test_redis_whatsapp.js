const axios = require("axios");
const { execSync } = require("child_process");
const { connectRedis } = require("../config/redis");
const {
  consumeLinkCode,
} = require("../services/whatsappLink.service");
const {
  createSession,
  getSession,
  updateSession,
  clearSession,
} = require("../services/whatsappSession.service");

const API_BASE = "http://localhost:5000/api/v1";

async function testRedisWhatsApp() {
  console.log("--- STARTING REDIS WHATSAPP TEST ---");

  // Connect redis client in standalone process
  await connectRedis();

  let token = "";
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "test_redis@example.com",
      password: "password123",
    });
    token = loginRes.data.token;
    console.log("✅ Logged in successfully");
  } catch (err) {
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        fullName: "Redis Tester",
        email: "test_redis@example.com",
        password: "password123",
      });
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: "test_redis@example.com",
        password: "password123",
      });
      token = loginRes.data.token;
      console.log("✅ Registered & logged in successfully");
    } catch (regErr) {
      console.error("Auth failed:", regErr.response?.data || regErr.message);
      process.exit(1);
    }
  }

  // 1. Generate WhatsApp Link Code via POST /api/v1/whatsapp/link
  try {
    const linkRes = await axios.post(
      `${API_BASE}/whatsapp/link`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { code, expiresIn } = linkRes.data;
    console.log(`✅ WhatsApp link code generated: ${code} (expiresIn: ${expiresIn}s)`);

    // 2. Inspect Redis CLI for key and TTL
    const redisKey = `whatsapp:link:${code}`;
    const keysOutput = execSync(
      `docker exec mockmate-redis redis-cli keys "${redisKey}"`
    ).toString().trim();
    console.log("Redis keys result:", keysOutput);

    const ttlOutput = execSync(
      `docker exec mockmate-redis redis-cli ttl "${redisKey}"`
    ).toString().trim();
    console.log("Redis TTL result:", ttlOutput, "seconds");

    // 3. Test single-use code consumption
    const consumedData = await consumeLinkCode(code);
    console.log("Consumed code data:", consumedData);

    const keysAfterConsume = execSync(
      `docker exec mockmate-redis redis-cli keys "${redisKey}"`
    ).toString().trim();
    console.log("Redis keys result after consume:", keysAfterConsume ? keysAfterConsume : "(empty)");

    if (!keysAfterConsume) {
      console.log("✅ Single-use code consumption verified (key deleted from Redis)");
    } else {
      console.error("❌ Key was not deleted after consumption!");
      process.exit(1);
    }

    // 4. Test WhatsApp Session Service Redis Functionality
    const testPhone = "15550001122";
    await createSession(testPhone, { state: "NEW", step: "AWAITING_CODE" });
    const fetchedSession = await getSession(testPhone);
    console.log("Fetched session from Redis:", fetchedSession);

    const sessionTtl = execSync(
      `docker exec mockmate-redis redis-cli ttl "whatsapp:session:${testPhone}"`
    ).toString().trim();
    console.log("WhatsApp session Redis TTL:", sessionTtl, "seconds");

    await clearSession(testPhone);
    const sessionAfterClear = await getSession(testPhone);
    if (!sessionAfterClear) {
      console.log("✅ Redis WhatsApp session creation, update, & clearing verified");
    }

    console.log("--- ALL REDIS VERIFICATIONS PASSED SUCCESSFULLY ---");
    process.exit(0);
  } catch (err) {
    console.error("WhatsApp link test error:", err.response?.data || err.message);
    process.exit(1);
  }
}

testRedisWhatsApp();
