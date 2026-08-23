const Admin = require('../../models/Admin');
const tokenService = require('../../services/tokenService');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const roles = require('../../constants/roles');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!admin.isActive) {
    throw new ApiError(httpStatusCodes.FORBIDDEN, 'Admin account has been deactivated');
  }

  const tokens = await tokenService.generateAuthTokens(admin, roles.ADMIN, req.ip, req.headers['user-agent']);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Admin authenticated successfully', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profileImage: admin.profileImage,
        role: admin.role
      },
      tokens
    })
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Admin profile fetched', admin)
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage } = req.body;
  const admin = await Admin.findById(req.user._id);

  if (name) admin.name = name;
  if (phone !== undefined) admin.phone = phone;
  if (profileImage !== undefined) admin.profileImage = profileImage;

  await admin.save();

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Profile updated successfully', admin)
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.user._id).select('+password');

  if (!(await admin.comparePassword(currentPassword))) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Incorrect current password');
  }

  admin.password = newPassword;
  await admin.save();

  // Invalidate previous sessions
  await tokenService.revokeAllUserSessions(admin._id);
  const newTokens = await tokenService.generateAuthTokens(admin, roles.ADMIN, req.ip, req.headers['user-agent']);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Password changed successfully', { tokens: newTokens })
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await tokenService.revokeToken(refreshToken);
  }
  res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Logged out successfully'));
});

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};