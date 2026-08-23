const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'User profile fetched', user)
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage, preferredLanguage, themePreference } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (themePreference) user.themePreference = themePreference;

  await user.save();

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Profile updated successfully', user)
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Current password does not match');
  }

  user.password = newPassword;
  await user.save();

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Password updated successfully')
  );
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};