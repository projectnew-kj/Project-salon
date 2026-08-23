const User = require('../models/User');
const tokenService = require('../services/tokenService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const httpStatusCodes = require('../constants/httpStatusCodes');
const roles = require('../constants/roles');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, preferredLanguage } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatusCodes.CONFLICT, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    preferredLanguage: preferredLanguage || 'en'
  });

  const tokens = await tokenService.generateAuthTokens(user, roles.USER, req.ip, req.headers['user-agent']);

  res.status(httpStatusCodes.CREATED).json(
    new ApiResponse(httpStatusCodes.CREATED, 'Account registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        themePreference: user.themePreference
      },
      tokens
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!user.isActive || user.isBlocked) {
    throw new ApiError(httpStatusCodes.FORBIDDEN, 'Account is suspended or deactivated');
  }

  const tokens = await tokenService.generateAuthTokens(user, roles.USER, req.ip, req.headers['user-agent']);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        preferredLanguage: user.preferredLanguage,
        themePreference: user.themePreference
      },
      tokens
    })
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const tokens = await tokenService.rotateRefreshToken(token, req.ip, req.headers['user-agent']);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Token refreshed successfully', { tokens })
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    await tokenService.revokeToken(token);
  }
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Logged out successfully'));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout
};