const Offer = require('../models/Offer');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getActiveOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    isDeleted: false,
    validFrom: { $lte: now },
    validTo: { $gte: now }
  })
    .populate('services', 'name price durationMinutes image')
    .sort({ displayOrder: 1, createdAt: -1 });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Active offers and bundle packages retrieved', offers)
  );
});

module.exports = {
  getActiveOffers
};