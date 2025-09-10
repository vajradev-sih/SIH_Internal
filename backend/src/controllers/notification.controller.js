import { Notification } from '../models/notifications.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all notifications for the authenticated user
export const getMyNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.user; // Get userId from authMiddleware

    const notifications = await Notification.find({ userId: userId })
        .sort({ createdAt: -1 })
        .populate('reportId', 'title status'); // Populate report details

    if (!notifications) {
        throw new ApiError(404, 'No notifications found for this user.');
    }

    return res.status(200).json(
        new ApiResponse(200, notifications, 'Notifications fetched successfully.')
    );
});

// Mark a specific notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { userId } = req.user; // Get userId from authMiddleware

    const notification = await Notification.findOneAndUpdate(
        { notificationId: notificationId, userId: userId }, // Find by notificationId and userId for security
        { status: 'read' },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, 'Notification not found or user not authorized.');
    }

    return res.status(200).json(
        new ApiResponse(200, notification, 'Notification marked as read.')
    );
});