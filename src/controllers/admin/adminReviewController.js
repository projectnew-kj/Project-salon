const Review = require('../../models/Review');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

const getAllReviews = asyncHandler(async (req, res) => {
  const { rating, isVisible, haircutId, offerId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (rating) filter.rating = parseInt(rating, 10);
  if (isVisible !== undefined) filter.isVisible = isVisible === 'true';
  if (haircutId) filter.haircut = haircutId;
  if (offerId) filter.offer = offerId;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email profileImage')
      .populate('haircut', 'name')
      .populate('offer', 'title')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter)
  ]);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Reviews retrieved', reviews, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name email profileImage')
    .populate('haircut', 'name')
    .populate('offer', 'title')
    .populate('booking', 'bookingCode bookingDate');

  if (!review) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Review not found');
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Review details retrieved', review)
  );
});

const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Review not found');
  }

  review.isVisible = !review.isVisible;
  await review.save();

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(
      httpStatusCodes.OK,
      `Review ${review.isVisible ? 'shown' : 'hidden'} successfully`,
      review
    )
  );
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Review not found');
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Review deleted successfully')
  );
});

const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);

  const summary = stats.length > 0
    ? {
        averageRating: Number(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews,
        breakdown: {
          5: stats[0].fiveStar,
          4: stats[0].fourStar,
          3: stats[0].threeStar,
          2: stats[0].twoStar,
          1: stats[0].oneStar
        }
      }
    : { averageRating: 0, totalReviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Review statistics retrieved', summary)
  );
});

module.exports = {
  getAllReviews,
  getReviewById,
  toggleReviewVisibility,
  deleteReview,
  getReviewStats
};
