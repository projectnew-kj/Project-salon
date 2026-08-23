const Haircut = require('../../models/Haircut');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const socketEmitter = require('../../sockets/socketEmitter');

const createHaircut = asyncHandler(async (req, res) => {
  const haircut = await Haircut.create(req.body);
  socketEmitter.emitHaircutUpdate('CREATED', haircut);

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Haircut service created', haircut)
  );
});

const getAllHaircuts = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const filter = { isDeleted: false };

  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const haircuts = await Haircut.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Haircuts retrieved', haircuts)
  );
});

const updateHaircut = asyncHandler(async (req, res) => {
  const haircut = await Haircut.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );

  if (!haircut) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Haircut service not found');
  }

  socketEmitter.emitHaircutUpdate('UPDATED', haircut);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Haircut service updated', haircut)
  );
});

const deleteHaircut = asyncHandler(async (req, res) => {
  const haircut = await Haircut.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!haircut) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'Haircut service not found');
  }

  socketEmitter.emitHaircutUpdate('DELETED', { id: req.params.id });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Haircut service deactivated successfully')
  );
});

module.exports = {
  createHaircut,
  getAllHaircuts,
  updateHaircut,
  deleteHaircut
};