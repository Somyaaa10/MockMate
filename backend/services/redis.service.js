const { redisClient } = require("../config/redis");

const setCache = async (key, value, expirySeconds = 3600) => {
  if (!redisClient.isReady) return false;
  await redisClient.set(key, JSON.stringify(value), {
    EX: expirySeconds,
  });
  return true;
};

const getCache = async (key) => {
  if (!redisClient.isReady) return null;
  const value = await redisClient.get(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value);
};

const deleteCache = async (key) => {
  if (!redisClient.isReady) return false;
  await redisClient.del(key);
  return true;
};

const setNxCache = async (key, value = "1", expirySeconds = 86400) => {
  if (!redisClient.isReady) {
    throw new Error("Redis client is not ready");
  }
  const result = await redisClient.set(
    key,
    typeof value === "string" ? value : JSON.stringify(value),
    {
      NX: true,
      EX: expirySeconds,
    }
  );
  return result === "OK";
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  setNxCache,
};
