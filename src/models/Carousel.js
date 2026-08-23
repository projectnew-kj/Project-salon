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
    image: {
      type: String,
      required: [true, 'Banner image URL is required']
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

const Carousel = mongoose.model('Carousel', carouselSchema);
module.exports = Carousel;