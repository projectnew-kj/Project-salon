const Booking = require('../models/Booking');
const bookingEngineService = require('../services/bookingEngineService');
const socketEmitter = require('../sockets/socketEmitter');
const notificationService = require('../services/notificationService');
const bookingStatus = require('../constants/bookingStatus');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Valid date in YYYY-MM-DD format is required');
  }

  const availability = await bookingEngineService.getAvailableSlotsForDate(date);
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Available slots calculated', availability)
  );
});

const createBooking = asyncHandler(async (req, res) => {
  const { itemType, itemId, bookingDate, bookingTime, notes } = req.body;

  const bookingPayload = await bookingEngineService.validateAndPrepareBooking({
    userId: req.user._id,
    itemType,
    itemId,
    bookingDate,
    bookingTime,
    notes
  });

  const newBooking = await Booking.create(bookingPayload);
  await newBooking.populate('haircut offer user', 'name email phone profileImage');

  // Broadcast real-time booking created event to Admin room and User channel
  socketEmitter.emitNewBooking(newBooking);
  notificationService.notifyBookingCreated(newBooking);

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Booking placed successfully', newBooking)
  );
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('haircut', 'name price durationMinutes image')
      .populate('offer', 'title offerPrice image')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Booking.countDocuments(filter)
  ]);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'User bookings retrieved', bookings, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

const getBookingDetails = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate('haircut')
    .populate('offer');

  if (!booking) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Booking not found');
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Booking details fetched', booking)
  );
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

  if (!booking) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (booking.status === bookingStatus.COMPLETED || booking.status === bookingStatus.CANCELLED) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, `Cannot cancel booking in '${booking.status}' status`);
  }

  booking.status = bookingStatus.CANCELLED;
  booking.statusHistory.push({
    status: bookingStatus.CANCELLED,
    changedBy: req.user._id,
    changedByModel: 'User',
    note: reason || 'Cancelled by customer',
    timestamp: new Date()
  });

  await booking.save();

  // Notify real-time
  socketEmitter.emitBookingStatusUpdate(booking);
  notificationService.notifyBookingStatusChange(booking);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Booking cancelled successfully', booking)
  );
});

module.exports = {
  getAvailableSlots,
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking
};