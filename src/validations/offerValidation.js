const Joi = require('joi');

const createOfferSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().max(1000).allow(''),
    image: Joi.string().uri().allow(''),
    originalPrice: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).required(),
    services: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    validFrom: Joi.date().required(),
    validTo: Joi.date().greater(Joi.ref('validFrom')).required(),
    displayOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true)
  })
});

const updateOfferSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim().max(1000).allow(''),
    image: Joi.string().uri().allow(''),
    originalPrice: Joi.number().min(0),
    offerPrice: Joi.number().min(0),
    services: Joi.array().items(Joi.string().hex().length(24)).min(1),
    validFrom: Joi.date(),
    validTo: Joi.date(),
    displayOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  }).min(1)
});

const deleteOfferSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
});

module.exports = {
  createOfferSchema,
  updateOfferSchema,
  deleteOfferSchema
};
