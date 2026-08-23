const Notification = require('../models/Notification');
const socketEmitter = require('../sockets/socketEmitter');
const logger = require('../config/logger');

class NotificationService {
  // Generic creator - persists to DB and pushes a real-time event
  async createNotification({ recipient, recipientModel, title, body, type = 'SYSTEM', data = {} }) {
    try {
      const notification = await Notification.create({
        recipient,
        recipientModel,
        title,
        body,
        type,
        data
      });

      socketEmitter.emitDirectNotification(recipient, notification);
      return notification;
    } catch (error) {
      // Notifications should never break the primary request flow
      logger.error(`Failed to create notification: ${error.message}`);
      return null;
    }
  }

  async notifyBookingCreated(booking) {
    const userId = booking.user._id || booking.user;
    return this.createNotification({
      recipient: userId,
      recipientModel: 'User',
      title: 'Booking Requested',
      body: `Your booking ${booking.bookingCode} has been received and is pending confirmation.`,
      type: 'BOOKING',
      data: { bookingId: booking._id, status: booking.status }
    });
  }

  async notifyBookingStatusChange(booking) {
    const userId = booking.user._id || booking.user;
    return this.createNotification({
      recipient: userId,
      recipientModel: 'User',
      title: 'Booking Status Updated',
      body: `Your booking ${booking.bookingCode} is now "${booking.status}".`,
      type: 'BOOKING',
      data: { bookingId: booking._id, status: booking.status }
    });
  }

  async notifyAdmins(adminIds, { title, body, type = 'SYSTEM', data = {} }) {
    const ids = Array.isArray(adminIds) ? adminIds : [adminIds];
    return Promise.all(
      ids.map((adminId) =>
        this.createNotification({ recipient: adminId, recipientModel: 'Admin', title, body, type, data })
      )
    );
  }

  async getNotificationsForRecipient(recipientId, recipientModel, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const filter = { recipient: recipientId, recipientModel };
    if (unreadOnly) filter.isRead = false;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: recipientId, recipientModel, isRead: false })
    ]);

    return {
      notifications,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      unreadCount
    };
  }

  async markAsRead(notificationId, recipientId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(recipientId, recipientModel) {
    await Notification.updateMany(
      { recipient: recipientId, recipientModel, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async deleteNotification(notificationId, recipientId) {
    const result = await Notification.findOneAndDelete({ _id: notificationId, recipient: recipientId });
    return result;
  }
}

module.exports = new NotificationService();
