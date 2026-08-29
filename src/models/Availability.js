const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // format "09:00" (24-hr)
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid 24hr time (HH:mm)']
    },
    endTime: {
      type: String, // format "13:00" (24-hr)
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid 24hr time (HH:mm)']
    },
    slotDurationMinutes: {
      type: Number,
      default: 30
    },
    maxConcurrentBookings: {
      type: Number,
      default: 2
    }
  },
  { _id: false }
);

const breakSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid break start time (HH:mm)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid break end time (HH:mm)']
    },
    label: {
      type: String,
      default: 'Break',
      trim: true,
      maxlength: 80
    }
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    scheduleType: {
      type: String,
      enum: ['FULL_DAY', 'HALF_DAY', 'CUSTOM'],
      default: 'FULL_DAY'
    },
    slots: [timeSlotSchema],
    breaks: {
      type: [breakSchema],
      default: []
    }
  },
  { _id: false }
);

const specialDateSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true
    },
    isHoliday: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      default: ''
    },
    customSlots: [timeSlotSchema],
    breaks: {
      type: [breakSchema],
      default: []
    }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    weeklySchedule: [dayScheduleSchema],
    specialDates: [specialDateSchema],
    isBusinessOpen: {
      type: Boolean,
      default: true
    },
    requireExactTimeSlot: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;