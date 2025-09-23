const express = require('express');
const router = express.Router();

const EmailController = require('../../controllers/EmployerControllers/EmailController');

// Single email or multiple emails
router.post('/send-email/:companyId', EmailController.sendEmail);

// Bulk email with batching and advanced features
router.post('/send-bulk-email/:companyId', EmailController.sendBulkEmail);

module.exports = router;
