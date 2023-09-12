const express = require('express'); 
const router = express.Router();
const landImageController = require('./../controllers/landImage.controller');
const authController = require('../controllers/auth.controller')
const multer = require('multer');
const addImage = require('./../controllers/firebase.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

router.use(authController.protect);
router
    .route('/')
    .get(authController.restrictTo('field','superAdmin'), landImageController.getAll)
    .post(authController.restrictTo('farmer'), upload, addImage, landImageController.create)
router
    .route('/:id')
    .get(landImageController.get)
    .patch(authController.restrictTo('farmer'), landImageController.update)
    .delete(authController.restrictTo('field','superAdmin'), landImageController.delete)

module.exports = router;