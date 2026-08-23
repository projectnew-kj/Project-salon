const crypto = require('crypto');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Haircut = require('../models/Haircut');
const Offer = require('../models/Offer');
const bookingStatus = require('../constants/bookingStatus');
const ApiError = require('../utils/apiError');
const httpStatusCodes = require('../constants/httpStatusCodes');
const { getDayName, timeToMinutes, minutesToTime } = require('../utils/dateTimeUtils');

class BookingEngineService {
  // Generates unique human-readable code: SB-YYYY-XXXX
  generateBookingCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const year = new Date().getFullYear();
    return `SB-${year}-${randomHex}`;
  }

  // Calculates valid slots for a given date considering bookings and configuration
  async getAvailableSlotsForDate(dateString) {
    const availabilityConfig = await Availability.findOne();
    if (!availabilityConfig || !availabilityConfig.isBusinessOpen) {
      return { isOpen: false, reason: 'Salon is currently closed', slots: [] };
    }

    // 1. Check for Special Dates / Holidays
    const specialDate = availabilityConfig.specialDates.find((sd) => sd.date === dateString);
    if (specialDate && specialDate.isHoliday) {
      return {
        isOpen: false,
        reason: specialDate.reason || 'Closed for Holiday',
        slots: []
      };
    }

    // 2. Determine Day Schedule
    const dayName = getDayName(dateString);
    const daySchedule = availabilityConfig.weeklySchedule.find((ws) => ws.day === dayName);

    if (!daySchedule || !daySchedule.isOpen) {
      return { isOpen: false, reason: `Closed on ${dayName}s`, slots: [] };
    }

    // Priority to custom slots on special date if specified
    const activeSlotsRanges = (specialDate && specialDate.customSlots?.length > 0)
      ? specialDate.customSlots
      : daySchedule.slots;

    if (!activeSlotsRanges || activeSlotsRanges.length === 0) {
      return { isOpen: false, reason: 'No working hours configured', slots: [] };
    }

    // 3. Fetch active bookings on that date
    const existingBookings = await Booking.find({
      bookingDate: dateString,
      status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED, bookingStatus.IN_PROGRESS] }
    }).select('bookingTime durationMinutes status');

    const generatedSlots = [];

    for (const range of activeSlotsRanges) {
      const startMin = timeToMinutes(range.startTime);
      const endMin = timeToMinutes(range.endTime);
      const interval = range.slotDurationMinutes || 30;
      const maxConcurrent = range.maxConcurrentBookings || 2;

      for (let curr = startMin; curr + interval <= endMin; curr += interval) {
        const timeSlotString = minutesToTime(curr);
        const slotEndString = minutesToTime(curr + interval);

        // Count overlapping bookings
        const overlappingCount = existingBookings.filter((b) => {
          if (!b.bookingTime) return false;
          const bStart = timeToMinutes(b.bookingTime);
          const bEnd = bStart + (b.durationMinutes || 30);
          return (curr < bEnd && (curr + interval) > bStart);
        }).length;

        const availableSeats = Math.max(0, maxConcurrent - overlappingCount);

        generatedSlots.push({
          time: timeSlotString,
          endTime: slotEndString,
          availableSeats,
          isAvailable: availableSeats > 0
        });
      }
    }

    return {
      isOpen: true,
      date: dateString,
      day: dayName,
      requireExactTimeSlot: availabilityConfig.requireExactTimeSlot,
      slots: generatedSlots
    };
  }

  // Pre-booking Validation and Pricing Aggregation
  async validateAndPrepareBooking({ userId, itemType, itemId, bookingDate, bookingTime, notes }) {
    let haircutDoc = null;
    let offerDoc = null;
    let totalAmount = 0;
    let durationMinutes = 30;

    if (itemType === 'HAIRCUT') {
      haircutDoc = await Haircut.findOne({ _id: itemId, isActive: true, isDeleted: false });
      if (!haircutDoc) {
        throw new ApiError(httpStatusCodes.NOT_FOUND, 'Selected haircut service is invalid or discontinued');
      }
      totalAmount = haircutDoc.price;
      durationMinutes = haircutDoc.durationMinutes;
    } else if (itemType === 'OFFER_PACKAGE') {
      offerDoc = await Offer.findOne({
        _id: itemId,
        isActive: true,
        isDeleted: false,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() }
      }).populate('services');

      if (!offerDoc) {
        throw new ApiError(httpStatusCodes.NOT_FOUND, 'Selected offer is either expired or unavailable');
      }
      totalAmount = offerDoc.offerPrice;
      durationMinutes = offerDoc.services.reduce((acc, s) => acc + (s.durationMinutes || 30), 0) || 45;
    } else {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Invalid booking item type');
    }

    // Availability validation
    const availabilityData = await this.getAvailableSlotsForDate(bookingDate);
    if (!availabilityData.isOpen) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, `Booking unavailable on ${bookingDate}: ${availabilityData.reason}`);
    }

    if (availabilityData.requireExactTimeSlot) {
      if (!bookingTime) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Time slot selection is required for this date');
      }

      const matchingSlot = availabilityData.slots.find((s) => s.time === bookingTime);
      if (!matchingSlot || !matchingSlot.isAvailable) {
        throw new ApiError(httpStatusCodes.CONFLICT, `Selected time slot (${bookingTime}) is already fully booked`);
      }
    }

    const bookingCode = this.generateBookingCode();

    const initialHistory = {
      status: bookingStatus.PENDING,
      changedBy: userId,
      changedByModel: 'User',
      note: 'Booking requested by customer',
      timestamp: new Date()
    };

    return {
      bookingCode,
      user: userId,
      itemType,
      haircut: haircutDoc ? haircutDoc._id : null,
      offer: offerDoc ? offerDoc._id : null,
      bookingDate,
      bookingTime: bookingTime || '',
      durationMinutes,
      totalAmount,
      status: bookingStatus.PENDING,
      statusHistory: [initialHistory],
      notes: notes || ''
    };
  }

  // Enforces valid state transitions
  validateStateTransition(currentStatus, nextStatus) {
    const transitions = {
      [bookingStatus.PENDING]: [bookingStatus.CONFIRMED, bookingStatus.CANCELLED, bookingStatus.REJECTED],
      [bookingStatus.CONFIRMED]: [bookingStatus.IN_PROGRESS, bookingStatus.CANCELLED],
      [bookingStatus.IN_PROGRESS]: [bookingStatus.COMPLETED, bookingStatus.CANCELLED],
      [bookingStatus.COMPLETED]: [],
      [bookingStatus.CANCELLED]: [],
      [bookingStatus.REJECTED]: []
    };

    const allowed = transitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        `Illegal status transition from "${currentStatus}" to "${nextStatus}"`
      );
    }
  }
}

module.exports = new BookingEngineService();