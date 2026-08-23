const Haircut = require('../models/Haircut');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getActiveHaircuts = asyncHandler(async (req, res) => {
  const haircuts = await Haircut.find({ isActive: true, isDeleted: false })
    .sort({ displayOrder: 1, createdAt: -1 });

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Haircuts retrieved', haircuts)
  );
});

const getHaircutById = asyncHandler(async (req, res) => {
  const haircut = await Haircut.findOne({ _id: req.params.id, isActive: true, isDeleted: false });
  if (!haircut) {
    return res.status(httpStatusCodes.NOT_FOUND).json(
      new ApiResponse(httpStatusCodes.NOT_FOUND, 'Haircut service not found')
    );
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Haircut details retrieved', haircut)
  );
});

module.exports = {
  getActiveHaircuts,
  getHaircutById
};