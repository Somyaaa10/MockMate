const crypto = require("crypto");

const { setCache, getCache, deleteCache } = require("./redis.service");

const LINK_TTL = 10 * 60; // 10 minutes

const getLinkKey = (code) => `whatsapp:link:${code}`;

const generateLinkCode = async (userId) => {
  const randomPart = crypto.randomInt(100000, 1000000);
  const code = `MM-${randomPart}`;

  await setCache(
    getLinkKey(code),
    {
      userId: userId.toString(),
      createdAt: new Date().toISOString(),
    },
    LINK_TTL,
  );

  return code;
};

const getLinkData = async (code) => {
  return await getCache(getLinkKey(code));
};

const consumeLinkCode = async (code) => {
  const data = await getLinkData(code);

  if (!data) {
    return null;
  }

  await deleteCache(getLinkKey(code));

  return data;
};

module.exports = {
  generateLinkCode,
  getLinkData,
  consumeLinkCode,
};
