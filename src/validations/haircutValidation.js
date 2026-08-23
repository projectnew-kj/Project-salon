const Joi = require('joi');

const createHaircutSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().max(1000).allow(''),
    image: Joi.string().uri().allow(''),
    price: Joi.number().min(0).required(),
    durationMinutes: Joi.number().integer().min(5).max(480).required(),
    displayOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true)
  })
});

const updateHaircutSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim().max(1000).allow(''),
    image: Joi.string().uri().allow(''),
    price: Joi.number().min(0),
    durationMinutes: Joi.number().integer().min(5).max(480),
    displayOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  }).min(1)
});

const deleteHaircutSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
});

module.exports = {
  createHaircutSchema,
  updateHaircutSchema,
  deleteHaircutSchema
};
