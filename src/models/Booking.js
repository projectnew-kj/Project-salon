const mongoose = require('mongoose');
const bookingStatus = require('../constants/bookingStatus');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(bookingStatus),
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['Admin', 'User', 'System'],
      default: 'System'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    itemType: {
      type: String,
      enum: ['HAIRCUT', 'OFFER_PACKAGE'],
      default: 'HAIRCUT',
      required: true
    },
    haircut: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Haircut',
      default: null
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null
    },
    bookingDate: {
      type: String, // "YYYY-MM-DD"
      required: [true, 'Booking date is required'],
      index: true
    },
    bookingTime: {
      type: String, // "HH:mm"
      default: ''
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(bookingStatus),
      default: bookingStatus.PENDING,
      index: true
    },
    statusHistory: [statusHistorySchema],
    notes: {
      type: String,
      default: ''
    },
    isReviewed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ bookingDate: 1, bookingTime: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;