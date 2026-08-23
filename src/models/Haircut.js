const mongoose = require('mongoose');

const haircutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Haircut name is required'],
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a non-negative number']
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 480 minutes']
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

haircutSchema.index({ name: 'text', description: 'text' });

const Haircut = mongoose.model('Haircut', haircutSchema);
module.exports = Haircut;