const Joi = require('joi');

const createBookingSchema = Joi.object({
  body: Joi.object({
    itemType: Joi.string().valid('HAIRCUT', 'OFFER_PACKAGE').required(),
    itemId: Joi.string().hex().length(24).required(),
    bookingDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({ 'string.pattern.base': 'bookingDate must be in YYYY-MM-DD format' }),
    bookingTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .allow('')
      .messages({ 'string.pattern.base': 'bookingTime must be in HH:mm 24-hour format' }),
    notes: Joi.string().trim().max(500).allow('')
  })
});

const updateBookingStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    status: Joi.string()
      .valid('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected')
      .required(),
    note: Joi.string().trim().max(500).allow('')
  })
});

const cancelBookingSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow('')
  })
});

const availableSlotsQuerySchema = Joi.object({
  query: Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' })
  })
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  availableSlotsQuerySchema
};
