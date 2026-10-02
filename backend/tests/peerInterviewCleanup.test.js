const mongoose = require("mongoose");
const PeerInterview = require("../models/peerInterview.model");
const User = require("../models/user.model");
const { cleanupAbandonedPeerInterviews } = require("../services/peerInterviewCleanup.service");
const { startPeerInterviewCleanupJob, stopPeerInterviewCleanupJob } = require("../jobs/peerInterviewCleanup.job");

describe("PeerInterview Cleanup Worker Verification", () => {
  let hostUser;

  afterAll(() => {
    stopPeerInterviewCleanupJob();
  });

  beforeEach(async () => {
    hostUser = await User.create({
      fullName: "Peer Host User",
      email: "peerhost@example.com",
      password: "Password123!",
    });
  });

  it("1. should cancel stale waiting room (> 2 hours old)", async () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "WAIT_STALE_001",
      status: "waiting",
      createdAt: threeHoursAgo,
    });

    const result = await cleanupAbandonedPeerInterviews();
    expect(result.cleanedCount).toBeGreaterThanOrEqual(1);

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("cancelled");
  });

  it("2. should cancel stale active room (> 4 hours old)", async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "ACT_STALE_001",
      status: "active",
      startedAt: fiveHoursAgo,
      createdAt: fiveHoursAgo,
    });

    const result = await cleanupAbandonedPeerInterviews();
    expect(result.cleanedCount).toBeGreaterThanOrEqual(1);

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("cancelled");
  });

  it("3. should NOT cancel completed room", async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "COMPLETED_001",
      status: "completed",
      completedAt: fiveHoursAgo,
      createdAt: fiveHoursAgo,
    });

    await cleanupAbandonedPeerInterviews();

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("completed");
  });

  it("4. should NOT alter cancelled room", async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "CANCELLED_001",
      status: "cancelled",
      createdAt: fiveHoursAgo,
    });

    await cleanupAbandonedPeerInterviews();

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("cancelled");
  });

  it("5. should NOT cancel recent active room with active participants", async () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "ACT_RECENT_001",
      status: "active",
      startedAt: thirtyMinsAgo,
      createdAt: thirtyMinsAgo,
      participants: [
        {
          user: hostUser._id,
          role: "interviewer",
          joinedAt: thirtyMinsAgo,
          leftAt: null,
        },
      ],
    });

    await cleanupAbandonedPeerInterviews();

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("active");
  });

  it("6. should soft-delete by updating status to cancelled and NOT hard-delete records", async () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "SOFT_DEL_001",
      status: "waiting",
      createdAt: threeHoursAgo,
    });

    await cleanupAbandonedPeerInterviews();

    const count = await PeerInterview.countDocuments({ _id: room._id });
    expect(count).toBe(1);

    const doc = await PeerInterview.findById(room._id);
    expect(doc.status).toBe("cancelled");
  });

  it("7. should handle empty cleanup result safely", async () => {
    const result = await cleanupAbandonedPeerInterviews();
    expect(result.scannedCount).toBe(0);
    expect(result.cleanedCount).toBe(0);
  });

  it("8. should cancel room when all joined participants have explicitly left", async () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

    const room = await PeerInterview.create({
      host: hostUser._id,
      roomCode: "ALL_LEFT_001",
      status: "active",
      startedAt: thirtyMinsAgo,
      createdAt: thirtyMinsAgo,
      participants: [
        {
          user: hostUser._id,
          role: "interviewer",
          joinedAt: thirtyMinsAgo,
          leftAt: tenMinsAgo,
        },
      ],
    });

    const result = await cleanupAbandonedPeerInterviews();
    expect(result.cleanedCount).toBeGreaterThanOrEqual(1);

    const updatedRoom = await PeerInterview.findById(room._id);
    expect(updatedRoom.status).toBe("cancelled");
  });

  it("9. should return duplicate singleton job instance if startPeerInterviewCleanupJob is called multiple times", () => {
    const job1 = startPeerInterviewCleanupJob();
    const job2 = startPeerInterviewCleanupJob();

    expect(job1).toBeDefined();
    expect(job1).toBe(job2);
  });

  it("10. should handle database error gracefully without throwing or crashing application", async () => {
    const findSpy = jest.spyOn(PeerInterview, "find").mockImplementationOnce(() => ({
      select: jest.fn().mockRejectedValueOnce(new Error("Simulated DB Failure")),
    }));

    const result = await cleanupAbandonedPeerInterviews();
    expect(result.error).toBe("Simulated DB Failure");
    expect(result.cleanedCount).toBe(0);

    findSpy.mockRestore();
  });
});
