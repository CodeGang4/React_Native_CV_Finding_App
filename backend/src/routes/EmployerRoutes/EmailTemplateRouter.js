const express = require('express');
const router = express.Router();

const EmailTemplateController = require('../../controllers/EmployerControllers/EmailTemplatesController');

router.post('/addTemplates', EmailTemplateController.addTemplates);
router.get('/getTemplates/:employerId', EmailTemplateController.getTemplatesByEmployer);
router.get('/getTemplate/:templateId', EmailTemplateController.getTemplates);
router.delete(
    '/deleteTemplate/:templateId',
    EmailTemplateController.deleteTemplate,
);
module.exports = router;
