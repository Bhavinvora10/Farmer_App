const express = require('express');
const authController = require('./../controllers/auth.controller');

const router = express.Router();

router.post('/signUp', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;