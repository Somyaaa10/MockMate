const express = require("express");

const {
  setCache,
  getCache,
  deleteCache,
} = require("../services/redis.service");

const router = express.Router();

router.post("/set", async (req, res) => {
  await setCache("mockmate:test", {
    message: "Redis is working",
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Redis value stored",
  });
});

router.get("/get", async (req, res) => {
  const data = await getCache("mockmate:test");

  res.json({
    success: true,
    data,
  });
});

router.delete("/delete", async (req, res) => {
  await deleteCache("mockmate:test");

  res.json({
    success: true,
    message: "Redis value deleted",
  });
});

module.exports = router;
