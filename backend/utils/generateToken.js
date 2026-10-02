const jwt = require("jsonwebtoken");
const { setCache, getCache, deleteCache } = require("../services/redis.service");

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

// Short-lived Access Token (15 minutes)
const generateAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
  return jwt.sign(
    { id: userId, type: "access" },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

// Long-lived Refresh Token (7 days)
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured in environment variables");
  }
  return jwt.sign(
    { id: userId, type: "refresh" },
    secret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

// Store Refresh Token in Redis
const storeRefreshTokenInRedis = async (userId, refreshToken) => {
  const key = `refresh:${userId.toString()}:${refreshToken}`;
  await setCache(
    key,
    { userId: userId.toString(), createdAt: new Date().toISOString() },
    REFRESH_TOKEN_TTL_SECONDS
  );
};

// Verify Refresh Token in Redis
const verifyRefreshTokenInRedis = async (userId, refreshToken) => {
  const key = `refresh:${userId.toString()}:${refreshToken}`;
  const data = await getCache(key);
  return Boolean(data);
};

// Remove Refresh Token from Redis (Logout / Invalidation)
const removeRefreshTokenFromRedis = async (userId, refreshToken) => {
  const key = `refresh:${userId.toString()}:${refreshToken}`;
  await deleteCache(key);
};

// Default export generates short-lived access token for backward compatibility
const generateToken = generateAccessToken;

module.exports = generateToken;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.storeRefreshTokenInRedis = storeRefreshTokenInRedis;
module.exports.verifyRefreshTokenInRedis = verifyRefreshTokenInRedis;
module.exports.removeRefreshTokenFromRedis = removeRefreshTokenFromRedis;

