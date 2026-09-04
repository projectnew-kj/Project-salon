const User = require('../../models/User');
const Booking = require('../../models/Booking');
const Review = require('../../models/Review');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const tokenService = require('../../services/tokenService');

const getAllUsers = asyncHandler(async (req, res) => {
  const { search, isBlocked, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter)
  ]);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Users retrieved', users, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'User not found');
  }

  const [bookings, reviews] = await Promise.all([
    Booking.find({ user: user._id }).sort({ createdAt: -1 }),
    Review.find({ user: user._id }).populate('haircut offer')
  ]);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'User details retrieved', {
      user,
      bookings,
      reviews
    })
  );
});


const changeUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.id).select('+password');

  if (!user) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'User not found');
  }

  user.password = newPassword;
  await user.save();
  await tokenService.revokeAllUserSessions(user._id);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'User password changed successfully')
  );
});

const toggleUserBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, 'User not found');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(
      httpStatusCodes.OK,
      `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user
    )
  );
});

module.exports = {
  getAllUsers,
  getUserDetails,
  changeUserPassword,
  toggleUserBlock
};