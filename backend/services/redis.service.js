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

module.exports = {
  setCache,
  getCache,
  deleteCache,
};
