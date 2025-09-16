const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const CandidatesController = require('../../controllers/ClientControllers/CandidatesController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/uploadPortfolio/:userId', upload.single('portfolio'), CandidatesController.uploadPortfolio);
router.post('/uploadCV/:userId', upload.single('cv'), CandidatesController.uploadCV);
router.post('/updateProfile/:userId', CandidatesController.updateProfile);
router.get('/getProfile/:userId', CandidatesController.getProfile)


module.exports = router