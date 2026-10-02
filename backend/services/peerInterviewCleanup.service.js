const PeerInterview = require("../models/peerInterview.model");

/**
 * Automatically detects and cleans up abandoned/stale PeerInterview rooms.
 * Criteria:
 * 1. Rooms in 'waiting' status created > 2 hours ago (never started).
 * 2. Rooms in 'active' status started > 4 hours ago (never completed).
 * 3. Rooms in 'waiting' or 'active' status where all participants have explicitly left (leftAt is not null).
 */
const cleanupAbandonedPeerInterviews = async () => {
  console.log("[PeerInterviewCleanup] Started");

  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    // Find stale waiting rooms (> 2 hours old)
    const staleWaitingRooms = await PeerInterview.find({
      status: "waiting",
      createdAt: { $lt: twoHoursAgo },
    }).select("_id roomCode");

    // Find stale active rooms (> 4 hours old)
    const staleActiveRooms = await PeerInterview.find({
      status: "active",
      $or: [
        { startedAt: { $lt: fourHoursAgo } },
        { startedAt: null, createdAt: { $lt: fourHoursAgo } },
      ],
    }).select("_id roomCode");

    // Find rooms in waiting/active status where at least one participant joined and ALL participants have left
    const allLeftRooms = await PeerInterview.find({
      status: { $in: ["waiting", "active"] },
      "participants.0": { $exists: true },
      participants: {
        $not: { $elemMatch: { leftAt: null } },
      },
    }).select("_id roomCode");

    // Aggregate unique room IDs to clean
    const staleRoomIds = Array.from(
      new Set([
        ...staleWaitingRooms.map((r) => r._id.toString()),
        ...staleActiveRooms.map((r) => r._id.toString()),
        ...allLeftRooms.map((r) => r._id.toString()),
      ])
    );

    if (staleRoomIds.length === 0) {
      console.log("[PeerInterviewCleanup] Cleaned 0 abandoned rooms");
      console.log("[PeerInterviewCleanup] Completed");
      return {
        scannedCount: 0,
        cleanedCount: 0,
      };
    }

    const result = await PeerInterview.updateMany(
      { _id: { $in: staleRoomIds } },
      { $set: { status: "cancelled" } }
    );

    const cleanedCount = result.modifiedCount || staleRoomIds.length;
    console.log(`[PeerInterviewCleanup] Cleaned ${cleanedCount} abandoned rooms`);
    console.log("[PeerInterviewCleanup] Completed");

    return {
      scannedCount: staleRoomIds.length,
      cleanedCount,
    };
  } catch (error) {
    console.error("[PeerInterviewCleanup] Error:", error.message);
    return {
      scannedCount: 0,
      cleanedCount: 0,
      error: error.message,
    };
  }
};

module.exports = {
  cleanupAbandonedPeerInterviews,
};
