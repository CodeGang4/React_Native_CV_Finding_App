const express = require('express');
const router = express.Router();

const EmailTemplateController = require('../../controllers/EmployerControllers/EmailTemplateController');

// Lấy tất cả templates của employer
router.get('/templates/:employerId', EmailTemplateController.getTemplates);

// Lấy template cụ thể
router.get(
    '/templates/:employerId/:templateId',
    EmailTemplateController.getTemplate,
);

// Tạo template mới
router.post('/templates/:employerId', EmailTemplateController.createTemplate);

// Cập nhật template
router.put(
    '/templates/:employerId/:templateId',
    EmailTemplateController.updateTemplate,
);

// Xóa template
router.delete(
    '/templates/:employerId/:templateId',
    EmailTemplateController.deleteTemplate,
);

// Preview template
router.post(
    '/templates/:employerId/:templateId/preview',
    EmailTemplateController.previewTemplate,
);

module.exports = router;
