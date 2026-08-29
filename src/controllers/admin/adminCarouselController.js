const Carousel = require('../../models/Carousel');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const socketEmitter = require('../../sockets/socketEmitter');

const createCarousel = asyncHandler(async (req, res) => {
  const payload = { ...req.body, image: req.body.images?.[0] || '' };
  const banner = await Carousel.create(payload);
  socketEmitter.emitCarouselUpdate('CREATED', banner);

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Banner added to carousel', banner)
  );
});

const getAllCarousels = asyncHandler(async (req, res) => {
  const banners = await Carousel.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Carousels retrieved', banners)
  );
});

const updateCarousel = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (Array.isArray(req.body.images)) {
    update.image = req.body.images[0] || '';
  }

  const banner = await Carousel.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });

  if (!banner) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Carousel banner not found');
  }

  socketEmitter.emitCarouselUpdate('UPDATED', banner);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Banner updated', banner)
  );
});

const deleteCarousel = asyncHandler(async (req, res) => {
  const banner = await Carousel.findByIdAndDelete(req.params.id);
  if (!banner) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Carousel banner not found');
  }

  socketEmitter.emitCarouselUpdate('DELETED', { id: req.params.id });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Banner removed from carousel')
  );
});

module.exports = {
  createCarousel,
  getAllCarousels,
  updateCarousel,
  deleteCarousel
};