const Joi = require('joi');

const imagesSchema = Joi.array()
  .items(Joi.string().uri())
  .min(1)
  .required();

const createCarouselSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().max(1000).allow('').default(''),
    images: imagesSchema,
    ctaAction: Joi.string().trim().max(50).allow('').default(''),
    ctaTargetId: Joi.string().trim().max(100).allow('').default(''),
    displayOrder: Joi.number().integer().min(0).default(0),
    startDate: Joi.date().default(() => new Date()),
    endDate: Joi.date().allow(null).default(null),
    isActive: Joi.boolean().default(true)
  }).custom((value, helpers) => {
    if (value.endDate && value.startDate && new Date(value.endDate) <= new Date(value.startDate)) {
      return helpers.message({ custom: 'endDate must be greater than startDate' });
    }
    return value;
  })
});

const updateCarouselSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    title: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim().max(1000).allow(''),
    images: Joi.array().items(Joi.string().uri()).min(1),
    ctaAction: Joi.string().trim().max(50).allow(''),
    ctaTargetId: Joi.string().trim().max(100).allow(''),
    displayOrder: Joi.number().integer().min(0),
    startDate: Joi.date(),
    endDate: Joi.date().allow(null),
    isActive: Joi.boolean()
  }).min(1)
});

const deleteCarouselSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
});

module.exports = {
  createCarouselSchema,
  updateCarouselSchema,
  deleteCarouselSchema
};
