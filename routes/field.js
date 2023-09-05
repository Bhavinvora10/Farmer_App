const express = require('express');
const fieldController = require('./../controllers/field.controller');
const authController = require('./../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(fieldController.getAll)
    .post(authController.restrictTo('superAdmin'), fieldController.create)

router
    .route('/:id')
    .get(fieldController.get)
    .patch(fieldController.update)
    .delete(authController.restrictTo('superAdmin'), fieldController.delete)

module.exports = router;