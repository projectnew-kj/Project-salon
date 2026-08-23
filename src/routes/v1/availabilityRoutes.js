const express = require('express');
const router = express.Router();
const Availability = require('../../models/Availability');
const bookingEngineService = require('../../services/bookingEngineService');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

// Public: retrieve the salon's general weekly schedule / holidays (read-only, no admin controls exposed)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const config = await Availability.findOne().select(
      'weeklySchedule specialDates isBusinessOpen requireExactTimeSlot'
    );

    if (!config) {
      return res.status(httpStatusCodes.OK).json(
        new ApiResponse(httpStatusCodes.OK, 'Availability not configured yet', {
          isBusinessOpen: true,
          weeklySchedule: [],
          specialDates: [],
          requireExactTimeSlot: true
        })
      );
    }

    res.status(httpStatusCodes.OK).json(
      new ApiResponse(httpStatusCodes.OK, 'Salon availability retrieved', config)
    );
  })
);

// Public: calculate bookable slots for a specific date
router.get(
  '/slots',
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Valid date in YYYY-MM-DD format is required');
    }

    const slots = await bookingEngineService.getAvailableSlotsForDate(date);
    res.status(httpStatusCodes.OK).json(
      new ApiResponse(httpStatusCodes.OK, 'Available slots calculated', slots)
    );
  })
);

module.exports = router;
