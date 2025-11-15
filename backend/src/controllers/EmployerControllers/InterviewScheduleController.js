const InterviewScheduleService = require('../../services/EmployerServices/InterviewSchedule.service');
const { asyncHandler } = require('../../middlewares/asyncHandler');
const { sendData } = require('../../utils/responseHelper');

class InterviewScheduleController {
    createInterviewSchedule = asyncHandler(async (req, res) => {
        const result = await InterviewScheduleService.createInterviewSchedule(req.body);
        sendData(res, result, 201);
    });

    getInterviewSchedulesByCompany = asyncHandler(async (req, res) => {
        const schedules = await InterviewScheduleService.getSchedulesByCompany(req.params.employer_id);
        sendData(res, schedules, 200);
    });

    updateInterviewSchedule = asyncHandler(async (req, res) => {
        const result = await InterviewScheduleService.updateSchedule(req.params.scheduleId, req.body);
        sendData(res, result, 200);
    });

    getInterviewScheduleDetail = asyncHandler(async (req, res) => {
        const schedule = await InterviewScheduleService.getScheduleDetail(req.params.scheduleId);
        sendData(res, schedule, 200);
    });

    updateScheduleStatus = asyncHandler(async (req, res) => {
        const schedule = await InterviewScheduleService.updateScheduleStatus(req.params.scheduleId, req.body.status);
        sendData(res, schedule, 200);
    });

    getScheduleByStatus = asyncHandler(async (req, res) => {
        const schedules = await InterviewScheduleService.getSchedulesByStatus(req.params.company_id, req.query.status);
        sendData(res, schedules, 200);
    });
}

module.exports = new InterviewScheduleController();
