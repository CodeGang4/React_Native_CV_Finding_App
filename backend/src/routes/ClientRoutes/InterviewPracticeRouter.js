const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const InterviewPracticeController = require('../../controllers/ClientControllers/InterviewPracticeController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
    '/grade/:userId/:questionId',
    InterviewPracticeController.gradingAnswer,
);
router.post(
    '/transcribeAudio/:userId/:questionId',
    InterviewPracticeController.transcribeAudio,
);
router.post(
    '/uploadAudio/:userId/:questionId',
    upload.single('audio'),
    InterviewPracticeController.uploadAudio,
);

module.exports = router;
