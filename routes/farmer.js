const express = require('express');
const router = express.Router({ mergeParams: true });
const farmerController = require('./../controllers/farmer.controller');
const authController = require('../controllers/auth.controller')


router.use(authController.protect);
router
    .route('/')
    .get(authController.restrictTo('field','superAdmin'), farmerController.getAll)
    .post(authController.restrictTo('field','superAdmin'), farmerController.create)
router
    .route('/:id')
    .get(authController.restrictTo('field','superAdmin'), farmerController.get)
    .patch(authController.restrictTo('farmer'), farmerController.update)

module.exports = router;