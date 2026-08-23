const Availability = require('../../models/Availability');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const socketEmitter = require('../../sockets/socketEmitter');

const getAvailabilityConfig = asyncHandler(async (req, res) => {
  let config = await Availability.findOne();
  if (!config) {
    // Initialize standard default availability
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
      day,
      isOpen: day !== 'Sunday',
      scheduleType: 'FULL_DAY',
      slots: [{ startTime: '09:00', endTime: '21:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }]
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

const updateAvailabilityConfig = asyncHandler(async (req, res) => {
  let config = await Availability.findOne();
  if (!config) {
    config = new Availability(req.body);
  } else {
    Object.assign(config, req.body);
  }

  await config.save();
  socketEmitter.emitAvailabilityUpdate(config);

  res.status(httpStatusCodes.OK).json(
    new ApiResponse(httpStatusCodes.OK, 'Availability settings updated successfully', config)
  );
});

module.exports = {
  getAvailabilityConfig,
  updateAvailabilityConfig
};