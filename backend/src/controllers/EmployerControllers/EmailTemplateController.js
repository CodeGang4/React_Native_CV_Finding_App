const EmailTemplateService = require('../../services/EmailTemplateService');
const { asyncHandler } = require('../../middlewares/asyncHandler');
const { sendData } = require('../../utils/responseHelper');

class EmailTemplateController {
    getTemplates = asyncHandler(async (req, res) => {
        const templates = await EmailTemplateService.getTemplates(req.params.employerId);
        sendData(res, templates, 200);
    });

    getTemplate = asyncHandler(async (req, res) => {
        const template = await EmailTemplateService.getTemplate(req.params.templateId);
        sendData(res, template, 200);
    });

    createTemplate = asyncHandler(async (req, res) => {
        const template = await EmailTemplateService.createTemplate(req.params.employerId, req.body);
        sendData(res, template, 201);
    });

    updateTemplate = asyncHandler(async (req, res) => {
        const template = await EmailTemplateService.updateTemplate(req.params.templateId, req.body);
        sendData(res, template, 200);
    });

    deleteTemplate = asyncHandler(async (req, res) => {
        await EmailTemplateService.deleteTemplate(req.params.templateId);
        sendData(res, { message: 'Template deleted successfully' }, 200);
    });

    previewTemplate = asyncHandler(async (req, res) => {
        const preview = await EmailTemplateService.previewTemplate(req.params.templateId, req.body.sampleData);
        sendData(res, preview, 200);
    });
}

module.exports = new EmailTemplateController();
