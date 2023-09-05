/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const userController = require('./../controllers/user.controller');
const authController = require('./../controllers/auth.controller');

const router = express.Router();
 
// router.post('/forgotPassword', authController.forgot);
// router.patch('/resetPassword/:token', authController.reset);

// Protect all routers after this middleware.
router.use(authController.protect);
    

router.use(authController.restrictTo('field','superAdmin'));

router
    .route('/')
    .get(userController.getAll)
    .post(userController.create);

router
    .route('/:id')
    .get(userController.get)
    .patch(userController.update)
    .delete(userController.delete);

module.exports = router;