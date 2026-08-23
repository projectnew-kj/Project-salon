const express = require('express');
const router = express.Router();
const offerController = require('../../controllers/offerController');

router.get('/', offerController.getActiveOffers);

module.exports = router;