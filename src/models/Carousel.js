const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // New canonical image field. A banner can contain one or more images.
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.every((image) => typeof image === 'string' && image.trim().length > 0),
        message: 'Carousel images must contain valid non-empty URLs'
      }
    },
    // Kept for backwards compatibility with existing carousel documents.
    image: {
      type: String,
      default: ''
    },
    ctaAction: {
      type: String,
      default: '' // e.g., 'BOOK_NOW', 'OFFER_VIEW', 'HAIRCUT_VIEW'
    },
    ctaTargetId: {
      type: String,
      default: ''
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Always expose a consistent images array, including for legacy documents that
// only have the old singular image field.
carouselSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const existingImages = Array.isArray(ret.images) ? ret.images.filter(Boolean) : [];
    if (ret.image && !existingImages.includes(ret.image)) {
      existingImages.unshift(ret.image);
    }
    ret.images = existingImages;
    return ret;
  }
});

const Carousel = mongoose.model('Carousel', carouselSchema);
module.exports = Carousel;
