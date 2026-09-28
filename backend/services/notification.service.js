const mongoose = require("mongoose");
const Notification = require("../models/notification.model");
const ApiError = require("../utils/ApiError");

let ioInstance = null;

const setNotificationIO = (io) => {
  ioInstance = io;
};

/**
 * Create a persistent notification and emit real-time Socket.io event to user room
 */
const createNotification = async ({
  userId,
  type = "SYSTEM",
  title,
  message,
  link = "",
  metadata = {},
}) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Valid User ID is required");
  }

  if (!title || !message) {
    throw new ApiError(400, "Notification title and message are required");
  }

  // Idempotency / Deduplication check for automated events
  if (metadata && (metadata.interviewId || metadata.resumeId || metadata.paymentId)) {
    const existing = await Notification.findOne({
      user: userId,
      type,
      $or: [
        { "metadata.interviewId": metadata.interviewId },
        { "metadata.resumeId": metadata.resumeId },
        { "metadata.paymentId": metadata.paymentId },
      ],
    });

    if (existing) {
      console.log(`ℹ️ Duplicate notification suppressed for user=${userId} type=${type}`);
      return existing;
    }
  }

  const notification = await Notification.create({
    user: userId,
    type,
    title: title.trim(),
    message: message.trim(),
    link: link ? link.trim() : "",
    metadata,
  });

  // Emit real-time Socket.io event if socket server instance is connected
  if (ioInstance) {
    const userRoom = `user:${userId.toString()}`;
    ioInstance.to(userRoom).emit("notification:new", { notification });
    console.log(`🔔 Socket notification:new emitted to room ${userRoom}`);
  }

  return notification;
};

/**
 * Fetch paginated notifications for the authenticated user
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get count of unread notifications for authenticated user
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    user: userId,
    read: false,
  });
  return { unreadCount: count };
};

/**
 * Mark a single notification as read (user ownership enforced)
 */
const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: userId,
    },
    {
      $set: { read: true },
    },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

/**
 * Mark all notifications as read for authenticated user
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );

  return { success: true, message: "All notifications marked as read" };
};

/**
 * Delete / dismiss a notification (user ownership enforced)
 */
const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return { success: true, message: "Notification deleted successfully" };
};

module.exports = {
  setNotificationIO,
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
