const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const notificationService = require("../services/notification.service");

// Get notifications list with pagination
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { page, limit } = req.query;

  const result = await notificationService.getUserNotifications(userId, page, limit);

  return res.status(200).json(
    new ApiResponse(200, result, "Notifications fetched successfully")
  );
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const result = await notificationService.getUnreadCount(userId);

  return res.status(200).json(
    new ApiResponse(200, result, "Unread notification count fetched")
  );
});

// Mark single notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;

  const notification = await notificationService.markAsRead(id, userId);

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const result = await notificationService.markAllAsRead(userId);

  return res.status(200).json(
    new ApiResponse(200, result, "All notifications marked as read")
  );
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;

  const result = await notificationService.deleteNotification(id, userId);

  return res.status(200).json(
    new ApiResponse(200, result, "Notification deleted")
  );
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
