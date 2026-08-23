const express = require('express');
const router = express.Router();
const haircutController = require('../../controllers/haircutController');

router.get('/', haircutController.getActiveHaircuts);
router.get('/:id', haircutController.getHaircutById);

module.exports = router;