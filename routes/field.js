const express = require('express');
const fieldController = require('./../controllers/field.controller');
const authController = require('./../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(authController.restrictTo('superAdmin'), fieldController.getAll)
    .post(authController.restrictTo('superAdmin'), fieldController.create)

router
    .route('/:id')
    .get(authController.restrictTo('field','superAdmin'), fieldController.get)
    .patch(authController.restrictTo('field'), fieldController.update)

module.exports = router;