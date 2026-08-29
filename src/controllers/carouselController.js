const Carousel = require('../models/Carousel');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getActiveCarousels = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Carousel.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }]
  }).sort({ displayOrder: 1, createdAt: -1 });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Active carousels retrieved', banners)
  );
});

module.exports = { getActiveCarousels };
