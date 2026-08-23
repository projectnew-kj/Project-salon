const socketEvents = require('../constants/socketEvents');
const logger = require('../config/logger');

class SocketEmitter {
  constructor() {
    this.io = null;
  }

  init(ioInstance) {
    this.io = ioInstance;
    logger.info('SocketEmitter singleton initialized with IO instance');
  }

  // --- BOOKING EVENTS ---
  emitNewBooking(bookingData) {
    if (!this.io) return;
    // Broadcast to all admins
    this.io.to('admin').emit(socketEvents.BOOKING_CREATED, bookingData);
    // Broadcast to the user who placed it
    if (bookingData.user?._id || bookingData.user) {
      const userId = (bookingData.user._id || bookingData.user).toString();
      this.io.to(`user:${userId}`).emit(socketEvents.BOOKING_CREATED, bookingData);
    }
  }

  emitBookingStatusUpdate(booking) {
    if (!this.io) return;
    const payload = {
      bookingId: booking._id,
      status: booking.status,
      statusHistory: booking.statusHistory,
      updatedAt: booking.updatedAt
    };

    // Broadcast to admin room
    this.io.to('admin').emit(socketEvents.BOOKING_STATUS_UPDATED, payload);
    // Broadcast to specific tracking room
    this.io.to(`booking:${booking._id.toString()}`).emit(socketEvents.BOOKING_STATUS_UPDATED, payload);
    // Broadcast to user's personal channel
    const userId = (booking.user._id || booking.user).toString();
    this.io.to(`user:${userId}`).emit(socketEvents.BOOKING_STATUS_UPDATED, payload);
  }

  // --- CATALOG & MARKETING REAL-TIME SYNC ---
  emitCarouselUpdate(action, carouselData) {
    if (!this.io) return;
    this.io.emit(socketEvents.CAROUSEL_UPDATED, { action, data: carouselData });
  }

  emitHaircutUpdate(action, haircutData) {
    if (!this.io) return;
    this.io.emit(socketEvents.HAIRCUT_UPDATED, { action, data: haircutData });
  }

  emitOfferUpdate(action, offerData) {
    if (!this.io) return;
    this.io.emit(socketEvents.OFFER_UPDATED, { action, data: offerData });
  }

  emitAvailabilityUpdate(scheduleData) {
    if (!this.io) return;
    this.io.emit(socketEvents.AVAILABILITY_UPDATED, scheduleData);
  }

  // --- DIRECT NOTIFICATIONS ---
  emitDirectNotification(recipientId, notificationData) {
    if (!this.io) return;
    this.io.to(`user:${recipientId.toString()}`).emit(socketEvents.NOTIFICATION_NEW, notificationData);
  }
}

module.exports = new SocketEmitter();