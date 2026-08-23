const ApiError = require('../utils/apiError');
const httpStatusCodes = require('../constants/httpStatusCodes');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return next(new ApiError(httpStatusCodes.UNAUTHORIZED, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new ApiError(httpStatusCodes.FORBIDDEN, 'Access forbidden: Insufficient permissions'));
    }

    next();
  };
};

module.exports = authorize;