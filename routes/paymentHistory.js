const express = require('express'); 
const router = express.Router();
const paymentHistoryController = require('./../controllers/payment.controller');
const authController = require('../controllers/auth.controller')

router.use(authController.protect);

router
    .route('/')
    .get(authController.restrictTo('superAdmin'), paymentHistoryController.getAll)

router
    .route('/:id')
    .post(paymentHistoryController.createCheckOutSession)
    .get(paymentHistoryController.get)

router
    .route('/webhook/:id')
    .post(paymentHistoryController.createWebhook)

module.exports = router;