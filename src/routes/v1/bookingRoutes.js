const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');
const authenticate = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const bookingValidation = require('../../validations/bookingValidation');

// Public slot calculation
router.get(
  '/available-slots',
  validate(bookingValidation.availableSlotsQuerySchema),
  bookingController.getAvailableSlots
);

// Authenticated booking creation
router.post(
  '/',
  authenticate,
  validate(bookingValidation.createBookingSchema),
  bookingController.createBooking
);

module.exports = router;
