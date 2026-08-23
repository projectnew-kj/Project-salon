const rateLimit = require('express-rate-limit');
const httpStatusCodes = require('../constants/httpStatusCodes');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: httpStatusCodes.TOO_MANY_REQUESTS,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP on auth routes to prevent brute-force attacks
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: httpStatusCodes.TOO_MANY_REQUESTS,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};