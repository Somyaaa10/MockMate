const cron = require("node-cron");
const { cleanupAbandonedPeerInterviews } = require("../services/peerInterviewCleanup.service");

let isExecuting = false;
let cronTask = null;

const startPeerInterviewCleanupJob = () => {
  if (cronTask) {
    console.log("[PeerInterviewCleanupJob] Scheduler already registered");
    return cronTask;
  }

  // Schedule task every 15 minutes
  cronTask = cron.schedule("*/15 * * * *", async () => {
    if (isExecuting) {
      console.log("[PeerInterviewCleanupJob] Previous cleanup execution still in progress. Skipping cycle.");
      return;
    }

    isExecuting = true;
    try {
      await cleanupAbandonedPeerInterviews();
    } catch (err) {
      console.error("[PeerInterviewCleanupJob] Unexpected execution error:", err.message);
    } finally {
      isExecuting = false;
    }
  });

  console.log("⏰ [PeerInterviewCleanupJob] Scheduler registered (interval: every 15 minutes)");
  return cronTask;
};

const stopPeerInterviewCleanupJob = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
  isExecuting = false;
};

module.exports = {
  startPeerInterviewCleanupJob,
  stopPeerInterviewCleanupJob,
};
