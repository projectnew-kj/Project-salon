const Review = require('../models/Review');
const Booking = require('../models/Booking');
const bookingStatus = require('../constants/bookingStatus');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
  if (!booking) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Associated booking not found');
  }

  if (booking.status !== bookingStatus.COMPLETED) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Reviews can only be submitted for completed bookings');
  }

  if (booking.isReviewed) {
    throw new ApiError(httpStatusCodes.CONFLICT, 'You have already reviewed this booking');
  }

  const review = await Review.create({
    booking: booking._id,
    user: req.user._id,
    haircut: booking.haircut,
    offer: booking.offer,
    rating,
    comment: comment || ''
  });

  booking.isReviewed = true;
  await booking.save();

  await review.populate('user', 'name profileImage');

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Review submitted successfully', review)
  );
});

const getPublicReviews = asyncHandler(async (req, res) => {
  const { haircutId, offerId, page = 1, limit = 10 } = req.query;
  const filter = { isVisible: true };
  if (haircutId) filter.haircut = haircutId;
  if (offerId) filter.offer = offerId;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [reviews, total, aggregateStats] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ])
  ]);

  const stats = aggregateStats.length > 0
    ? {
        averageRating: Number(aggregateStats[0].avgRating.toFixed(1)),
        totalReviews: aggregateStats[0].totalReviews
      }
    : { averageRating: 5.0, totalReviews: 0 };

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Reviews fetched', { reviews, stats }, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

module.exports = {
  createReview,
  getPublicReviews
};