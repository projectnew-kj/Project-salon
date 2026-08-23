const httpStatusCodes = require('../constants/httpStatusCodes');
const logger = require('../config/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (!statusCode) {
    statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  const response = {
    success: false,
    statusCode,
    message: err.message || message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  };

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };