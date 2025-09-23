const express = require('express');
const router = express.Router();

const InterviewScheduleController = require('../../controllers/EmployerControllers/InterviewScheduleController');

// Lấy tất cả lịch phỏng vấn
router.patch(
    '/update/:scheduleId',
    InterviewScheduleController.updateInterviewSchedule,
);
router.post('/create', InterviewScheduleController.createInterviewSchedule);
router.get(
    '/:employer_id',
    InterviewScheduleController.getInterviewSchedulesByCompany,
);
router.get(
    '/detail/:scheduleId',
    InterviewScheduleController.getInterviewScheduleDetail,
);

module.exports = router;
