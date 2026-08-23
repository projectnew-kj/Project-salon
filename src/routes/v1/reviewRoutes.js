const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');

router.get('/', reviewController.getPublicReviews);

module.exports = router;