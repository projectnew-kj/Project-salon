const Joi = require('joi');

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().trim().allow('').default(''),
    preferredLanguage: Joi.string().valid('en', 'ta', 'ml', 'hi', 'kn').default('en')
  })
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
  })
});

const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required()
  })
});

const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required()
  })
});

const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    phone: Joi.string().trim().allow(''),
    profileImage: Joi.string().uri().allow(''),
    preferredLanguage: Joi.string().valid('en', 'ta', 'ml', 'hi', 'kn'),
    themePreference: Joi.string().valid('light', 'dark', 'system')
  }).min(1)
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema
};