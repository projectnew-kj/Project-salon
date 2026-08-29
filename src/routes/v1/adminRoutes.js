const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authMiddleware');
const authorize = require('../../middlewares/roleMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const roles = require('../../constants/roles');

const adminAuthController = require('../../controllers/admin/adminAuthController');
const adminHaircutController = require('../../controllers/admin/adminHaircutController');
const adminOfferController = require('../../controllers/admin/adminOfferController');
const adminCarouselController = require('../../controllers/admin/adminCarouselController');
const adminBookingController = require('../../controllers/admin/adminBookingController');
const adminUserController = require('../../controllers/admin/adminUserController');
const availabilityController = require('../../controllers/admin/availabilityController');
const adminReviewController = require('../../controllers/admin/adminReviewController');
const authValidation = require('../../validations/authValidation');
const haircutValidation = require('../../validations/haircutValidation');
const offerValidation = require('../../validations/offerValidation');
const carouselValidation = require('../../validations/carouselValidation');
const bookingValidation = require('../../validations/bookingValidation');
const notificationService = require('../../services/notificationService');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const httpStatusCodes = require('../../constants/httpStatusCodes');

// Public Admin Auth
router.post('/auth/login', validate(authValidation.loginSchema), adminAuthController.login);

// Protected Admin Routes Guard
router.use(authenticate, authorize(roles.ADMIN));

// Profile & Session
router.get('/profile', adminAuthController.getProfile);
router.patch('/profile', adminAuthController.updateProfile);
router.post('/change-password', validate(authValidation.changePasswordSchema), adminAuthController.changePassword);
router.post('/logout', adminAuthController.logout);

// Analytics & Dashboard
router.get('/dashboard/analytics', adminBookingController.getDashboardAnalytics);

// Haircuts CRUD
router.route('/haircuts')
  .post(validate(haircutValidation.createHaircutSchema), adminHaircutController.createHaircut)
  .get(adminHaircutController.getAllHaircuts);

router.route('/haircuts/:id')
  .patch(validate(haircutValidation.updateHaircutSchema), adminHaircutController.updateHaircut)
  .delete(validate(haircutValidation.deleteHaircutSchema), adminHaircutController.deleteHaircut);

// Offers & Bundles CRUD
router.route('/offers')
  .post(validate(offerValidation.createOfferSchema), adminOfferController.createOffer)
  .get(adminOfferController.getAllOffers);

router.route('/offers/:id')
  .patch(validate(offerValidation.updateOfferSchema), adminOfferController.updateOffer)
  .delete(validate(offerValidation.deleteOfferSchema), adminOfferController.deleteOffer);

// Carousel Banners CRUD
router.route('/carousels')
  .post(validate(carouselValidation.createCarouselSchema), adminCarouselController.createCarousel)
  .get(adminCarouselController.getAllCarousels);

router.route('/carousels/:id')
  .patch(validate(carouselValidation.updateCarouselSchema), adminCarouselController.updateCarousel)
  .delete(validate(carouselValidation.deleteCarouselSchema), adminCarouselController.deleteCarousel);

// Bookings Management
router.get('/bookings', adminBookingController.getAllBookings);
router.get('/bookings/:id', adminBookingController.getBookingById);
router.patch(
  '/bookings/:id/status',
  validate(bookingValidation.updateBookingStatusSchema),
  adminBookingController.updateBookingStatus
);

// User Management
router.get('/users', adminUserController.getAllUsers);
router.get('/users/:id', adminUserController.getUserDetails);
router.patch('/users/:id/toggle-block', adminUserController.toggleUserBlock);

// Reviews Management
router.get('/reviews', adminReviewController.getAllReviews);
router.get('/reviews/stats', adminReviewController.getReviewStats);
router.get('/reviews/:id', adminReviewController.getReviewById);
router.patch('/reviews/:id/toggle-visibility', adminReviewController.toggleReviewVisibility);
router.delete('/reviews/:id', adminReviewController.deleteReview);

// Availability & Schedule Management
router.get('/availability', availabilityController.getAvailabilityConfig);
router.put('/availability', availabilityController.updateAvailabilityConfig);

// Notifications
router.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const result = await notificationService.getNotificationsForRecipient(req.user._id, 'Admin', req.query);
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
    await notificationService.markAllAsRead(req.user._id, 'Admin');
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, 'All notifications marked as read'));
  })
);

module.exports = router;