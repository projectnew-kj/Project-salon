const tokenService = require('../services/tokenService');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const httpStatusCodes = require('../constants/httpStatusCodes');
const roles = require('../constants/roles');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await tokenService.verifyAccessToken(token);

    let account;
    if (decoded.role === roles.ADMIN) {
      account = await Admin.findById(decoded.id).select('+password');
    } else {
      account = await User.findById(decoded.id).select('+password');
    }

    if (!account) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Account no longer exists');
    }

    if (!account.isActive) {
      throw new ApiError(httpStatusCodes.FORBIDDEN, 'Account is deactivated');
    }

    if (account.isBlocked) {
      throw new ApiError(httpStatusCodes.FORBIDDEN, 'Account has been suspended');
    }

    if (account.changedPasswordAfter(decoded.iat)) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Password recently changed. Please log in again');
    }

    req.user = account;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid or expired access token'));
    }
    next(error);
  }
};

module.exports = authenticate;