const express = require('express');
const router = express.Router();

const SaveJobController = require('../../controllers/ClientControllers/SaveJobController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/save/:candidate_id', SaveJobController.saveJobs);
router.delete('/unsave/:candidate_id', SaveJobController.unsaveJob);
router.get('/getJobs/:candidate_id', SaveJobController.getJobsByCandidates);
router.get('/getSavedJobsDetails/:candidate_id/:job_id', SaveJobController.getSavedJobsDetails);
module.exports = router