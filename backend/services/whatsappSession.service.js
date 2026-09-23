const { setCache, getCache, deleteCache } = require("./redis.service");

const SESSION_TTL = 30 * 60; // 30 minutes

const getSessionKey = (phone) => {
  return `whatsapp:session:${phone}`;
};

const createSession = async (phone, data = {}) => {
  const session = {
    state: "NEW",
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await setCache(getSessionKey(phone), session, SESSION_TTL);

  return session;
};

const getSession = async (phone) => {
  return await getCache(getSessionKey(phone));
};

const updateSession = async (phone, data) => {
  const existingSession = await getSession(phone);

  const session = {
    ...(existingSession || {}),
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await setCache(getSessionKey(phone), session, SESSION_TTL);

  return session;
};

const clearSession = async (phone) => {
  await deleteCache(getSessionKey(phone));
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  clearSession,
};
