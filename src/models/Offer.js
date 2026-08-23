const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price cannot be negative']
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
      min: [0, 'Offer price cannot be negative']
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Haircut',
        required: true
      }
    ],
    validFrom: {
      type: Date,
      required: [true, 'Offer start date is required'],
      index: true
    },
    validTo: {
      type: Date,
      required: [true, 'Offer expiry date is required'],
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

offerSchema.pre('save', function (next) {
  if (this.originalPrice && this.offerPrice) {
    const discount = ((this.originalPrice - this.offerPrice) / this.originalPrice) * 100;
    this.discountPercentage = Math.max(0, Math.round(discount));
  }
  next();
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;