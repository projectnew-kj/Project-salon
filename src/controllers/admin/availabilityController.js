const Availability = require('../../models/Availability');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const socketEmitter = require('../../sockets/socketEmitter');
const User = require('../../models/User');
const notificationService = require('../../services/notificationService');
const { timeToMinutes } = require('../../utils/dateTimeUtils');

const getAvailabilityConfig = asyncHandler(async (req, res) => {
  let config = await Availability.findOne();
  if (!config) {
    // Initialize standard default availability
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
      day,
      isOpen: day !== 'Sunday',
      scheduleType: 'FULL_DAY',
      slots: [{ startTime: '09:00', endTime: '21:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }],
      breaks: []
    }));

    config = await Availability.create({
      weeklySchedule: defaultDays,
      specialDates: [],
      isBusinessOpen: true,
      requireExactTimeSlot: true
    });
  }

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Availability configuration retrieved', config)
  );
});

const validateSchedulePayload = (payload) => {
  const days = payload.weeklySchedule || [];
  const errors = [];

  for (const day of days) {
    if (!day.day) {
      errors.push('Each weekly schedule entry must have a day');
      continue;
    }

    const ranges = (day.slots || []).filter(Boolean);
    if (day.isOpen && ranges.length === 0) {
      errors.push(`${day.day}: opening and closing times are required when the day is open`);
      continue;
    }

    for (const range of ranges) {
      if (timeToMinutes(range.startTime) >= timeToMinutes(range.endTime)) {
        errors.push(`${day.day}: closing time must be later than opening time`);
      }
    }

    const breaks = (day.breaks || []).filter(Boolean);
    const primaryRange = ranges[0];
    if (primaryRange) {
      const open = timeToMinutes(primaryRange.startTime);
      const close = timeToMinutes(primaryRange.endTime);

      const normalizedBreaks = breaks.map((item) => ({
        ...item,
        start: timeToMinutes(item.startTime),
        end: timeToMinutes(item.endTime)
      }));

      normalizedBreaks.forEach((item, index) => {
        if (item.start >= item.end) {
          errors.push(`${day.day}: break ${index + 1} end time must be later than start time`);
        }
        if (item.start < open || item.end > close) {
          errors.push(`${day.day}: break ${index + 1} must be within operating hours`);
        }
      });

      for (let i = 0; i < normalizedBreaks.length; i += 1) {
        for (let j = i + 1; j < normalizedBreaks.length; j += 1) {
          if (normalizedBreaks[i].start < normalizedBreaks[j].end && normalizedBreaks[i].end > normalizedBreaks[j].start) {
            errors.push(`${day.day}: breaks cannot overlap`);
          }
        }
      }
    }
  }

  return errors;
};

const updateAvailabilityConfig = asyncHandler(async (req, res) => {
  const validationErrors = validateSchedulePayload(req.body);
  if (validationErrors.length) {
    return res.status(httpStatusCodes.BAD_REQUEST).json(
      new ApiResponse(httpStatusCodes.BAD_REQUEST, validationErrors[0], { errors: validationErrors })
    );
  }

  let config = await Availability.findOne();
  if (!config) {
    config = new Availability(req.body);
  } else {
    Object.assign(config, req.body);
  }

  await config.save();
  socketEmitter.emitAvailabilityUpdate(config);

  // Persist a user notification and push it over the existing Socket.IO channel.
  // Notifications are intentionally fire-and-forget so schedule updates are never blocked by them.
  User.find({ isActive: true, isBlocked: false }).select('_id').lean()
    .then((users) => {
      const dayCount = (config.weeklySchedule || []).filter((day) => day.isOpen).length;
      return Promise.all(users.map((user) => notificationService.createNotification({
        recipient: user._id,
        recipientModel: 'User',
        title: 'Salon Hours Updated',
        body: `Our operating hours have been updated for ${dayCount} open days. Please review the latest available appointment times before booking.`,
        type: 'SYSTEM',
        data: { availabilityUpdatedAt: config.updatedAt }
      })));
    })
    .catch(() => {});

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Availability settings updated successfully', config)
  );
});

module.exports = {
  getAvailabilityConfig,
  updateAvailabilityConfig
};