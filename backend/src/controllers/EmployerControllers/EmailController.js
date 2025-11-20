const EmailService = require('../../services/EmployerServices/Email.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class EmailController {
    sendEmail = asyncHandler(async (req, res) => {
        const result = await EmailService.sendEmail(req.params.companyId, req.body);
        sendData(res, result, 200);
    });

    sendBulkEmail = asyncHandler(async (req, res) => {
        const result = await EmailService.sendBulkEmail(req.params.companyId, req.body);
        sendData(res, result, 200);
    });

    getEmailHistory = asyncHandler(async (req, res) => {
        const history = await EmailService.getEmailHistory(req.params.companyId, req.query);
        sendData(res, history, 200);
    });

    getEmailStats = asyncHandler(async (req, res) => {
        const stats = await EmailService.getEmailStats(req.params.companyId);
        sendData(res, stats, 200);
    });
}

module.exports = new EmailController();
