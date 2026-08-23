const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const haircutRoutes = require('./haircutRoutes');
const offerRoutes = require('./offerRoutes');
const bookingRoutes = require('./bookingRoutes');
const reviewRoutes = require('./reviewRoutes');
const availabilityRoutes = require('./availabilityRoutes');
const localizationController = require('../../controllers/localizationController');

// Localization endpoints
router.get('/languages', localizationController.getSupportedLanguages);
router.get('/languages/:code/translations', localizationController.getTranslationsByCode);

// Mount Modular Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/haircuts', haircutRoutes);
router.use('/offers', offerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/availability', availabilityRoutes);

module.exports = router;