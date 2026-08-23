const Booking = require('../../models/Booking');
const bookingEngineService = require('../../services/bookingEngineService');
const socketEmitter = require('../../sockets/socketEmitter');
const notificationService = require('../../services/notificationService');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

const getAllBookings = asyncHandler(async (req, res) => {
  const { status, date, userId, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) filter.bookingDate = date;
  if (userId) filter.user = userId;
  if (search) {
    filter.bookingCode = { $regex: search, $options: 'i' };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email phone profileImage')
      .populate('haircut', 'name price durationMinutes image')
      .populate('offer', 'title offerPrice image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Booking.countDocuments(filter)
  ]);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Bookings fetched', bookings, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('haircut')
    .populate('offer');

  if (!booking) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Booking not found');
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Booking details fetched', booking)
  );
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Validate state transition
  bookingEngineService.validateStateTransition(booking.status, status);

  booking.status = status;
  booking.statusHistory.push({
    status,
    changedBy: req.user._id,
    changedByModel: 'Admin',
    note: note || `Status changed to ${status} by Admin`,
    timestamp: new Date()
  });

  await booking.save();

  // Trigger real-time Socket updates to user and tracking room
  socketEmitter.emitBookingStatusUpdate(booking);
  notificationService.notifyBookingStatusChange(booking);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, `Booking marked as ${status}`, booking)
  );
});

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [
    totalBookings,
    todayBookings,
    pendingBookings,
    completedBookings,
    revenueData
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ bookingDate: today }),
    Booking.countDocuments({ status: 'Pending' }),
    Booking.countDocuments({ status: 'Completed' }),
    Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Analytics summary', {
      totalBookings,
      todayBookings,
      pendingBookings,
      completedBookings,
      totalRevenue
    })
  );
});

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getDashboardAnalytics
};