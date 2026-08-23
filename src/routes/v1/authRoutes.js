const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const validate = require('../../middlewares/validateMiddleware');
const authValidation = require('../../validations/authValidation');

router.post('/register', validate(authValidation.registerSchema), authController.register);
router.post('/login', validate(authValidation.loginSchema), authController.login);
router.post('/refresh-token', validate(authValidation.refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;