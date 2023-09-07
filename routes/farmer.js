const express = require('express');
const router = express.Router({ mergeParams: true });
const farmerController = require('./../controllers/farmer.controller');
const authController = require('../controllers/auth.controller')


router.use(authController.protect);
router
    .route('/')
    .get(farmerController.getAll)
    .post(authController.restrictTo('field','superAdmin'), farmerController.create)
router
    .route('/:id')
    .get(farmerController.get)
    .patch(farmerController.update)
    // .delete(authController.restrictTo('field','superAdmin'), farmerController.delete)

module.exports = router;