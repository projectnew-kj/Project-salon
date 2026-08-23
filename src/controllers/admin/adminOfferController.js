const Offer = require('../../models/Offer');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const socketEmitter = require('../../sockets/socketEmitter');

const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  await offer.populate('services');
  socketEmitter.emitOfferUpdate('CREATED', offer);

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Offer bundle created', offer)
  );
});

const getAllOffers = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = { isDeleted: false };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const offers = await Offer.find(filter)
    .populate('services', 'name price durationMinutes image')
    .sort({ displayOrder: 1, createdAt: -1 });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Offers retrieved', offers)
  );
});

const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  ).populate('services');

  if (!offer) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Offer bundle not found');
  }

  socketEmitter.emitOfferUpdate('UPDATED', offer);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Offer bundle updated', offer)
  );
});

const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!offer) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Offer bundle not found');
  }

  socketEmitter.emitOfferUpdate('DELETED', { id: req.params.id });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Offer bundle removed')
  );
});

module.exports = {
  createOffer,
  getAllOffers,
  updateOffer,
  deleteOffer
};