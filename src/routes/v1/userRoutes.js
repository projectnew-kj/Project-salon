const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const bookingController = require('../../controllers/bookingController');
const reviewController = require('../../controllers/reviewController');
const authenticate = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const authValidation = require('../../validations/authValidation');
const bookingValidation = require('../../validations/bookingValidation');
const notificationService = require('../../services/notificationService');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(authValidation.updateProfileSchema), userController.updateProfile);
router.post('/change-password', validate(authValidation.changePasswordSchema), userController.changePassword);

// User Bookings
router.get('/bookings', bookingController.getUserBookings);
router.get('/bookings/:id', bookingController.getBookingDetails);
router.post(
  '/bookings/:id/cancel',
  validate(bookingValidation.cancelBookingSchema),
  bookingController.cancelBooking
);

// Reviews
router.post('/reviews', reviewController.createReview);

// Notifications
router.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const result = await notificationService.getNotificationsForRecipient(req.user._id, 'User', req.query);
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Notifications retrieved', result));
  })
);
router.patch(
  '/notifications/:id/read',
  asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'Notification marked as read', notification));
  })
);
router.patch(
  '/notifications/read-all',
  asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user._id, 'User');
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'All notifications marked as read'));
  })
);

module.exports = router;