const express = require('express'); 
const router = express.Router();
const paymentHistoryController = require('./../controllers/payment.controller');
const authController = require('../controllers/auth.controller')

router.use(authController.protect);

router
    .route('/')
    .get(authController.restrictTo('superAdmin'), paymentHistoryController.getAll)
    .post(paymentHistoryController.createCheckOutSession)

router
    .route('/webhook')
    .post(paymentHistoryController.createWebhook)

router
    .route('/:id')
    .get(paymentHistoryController.get)

module.exports = router;