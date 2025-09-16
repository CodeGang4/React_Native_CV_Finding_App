const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const UserController = require('../../controllers/ClientControllers/UserController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/uploadPortfolio/:userId', upload.single('portfolio'), UserController.uploadPortfolio);
router.post('/uploadCV/:userId', upload.single('cv'), UserController.uploadCV);
router.post('/updateProfile/:userId', UserController.updateProfile);
router.post('/updateInfor/:userId', UserController.updateUserRole);
router.get('/getInfor/:userId', UserController.getUserProfile);

module.exports = router