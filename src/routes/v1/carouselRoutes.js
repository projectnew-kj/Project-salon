const express = require('express');
const router = express.Router();
const carouselController = require('../../controllers/carouselController');

// Public endpoint used by the customer app (including guest users).
router.get('/', carouselController.getActiveCarousels);

module.exports = router;
