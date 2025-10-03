const express = require('express');
const router = express.Router();
const QuestionController = require('../../controllers/AdminControllers/QuestionController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/create', QuestionController.createQuestion);
router.delete('/delete/:id', QuestionController.deleteQuestion);
router.patch('/update/:id', QuestionController.updateQuestion);
router.post('/generate', QuestionController.generate);
router.get(
    '/getQuestionsByIndustryAndLevel',
    QuestionController.getQuestionsByIndustryAndLevel,
);
router.get(
    '/getQuestionsByIndustry',
    QuestionController.getQuestionsByIndustry,
);
router.get('/getQuestions', QuestionController.getAllQuestions);
module.exports = router;
