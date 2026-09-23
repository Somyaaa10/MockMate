const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error("Redis connection retries exhausted");
      }
      return Math.min(retries * 200, 2000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("⚡ Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis connected and ready");
});

redisClient.on("error", (error) => {
  console.error("❌ Redis error:", error.message);
});

redisClient.on("end", () => {
  console.log("🔌 Redis connection closed");
});

const connectRedis = async () => {
  if (redisClient.isOpen) {
    return true;
  }

  try {
    await redisClient.connect();
    return redisClient.isReady;
  } catch (error) {
    console.warn("⚠️ Redis unavailable; continuing without cache:", error.message);
    return false;
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
