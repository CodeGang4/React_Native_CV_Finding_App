const express = require('express');
const router = express.Router();

const ApplicationController = require('../../controllers/ClientControllers/ApplicationController');

router.post('/create', ApplicationController.createApplication);
router.patch(
    '/updateStatus/:applicationId',
    ApplicationController.updateStatus,
);
router.get('/calculate/:jobId', ApplicationController.calculateCompetitionRate);
router.get('/getAllCandidates/:jobId', ApplicationController.getAllCandidates);
router.get(
    '/getAllApplicationsByStatus/:job_id',
    ApplicationController.getAllApplicationsByStatus,
);
router.get(
    '/getApplicationByCandidate/:candidate_id',
    ApplicationController.getApplicationByCandidate,
);

module.exports = router;
