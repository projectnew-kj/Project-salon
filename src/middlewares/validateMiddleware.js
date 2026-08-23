const httpStatusCodes = require('../constants/httpStatusCodes');
const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = ['params', 'query', 'body'].reduce((acc, key) => {
    if (schema[key]) acc[key] = req[key];
    return acc;
  }, {});

  const { error, value } = schema.validate(validSchema, {
    abortEarly: false,
    stripUnknown: true,
    errors: { label: 'key' }
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(httpStatusCodes.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;