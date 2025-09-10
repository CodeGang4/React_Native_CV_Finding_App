const express = require('express');
const router = express.Router();

const JobController = require('../../controllers/EmployerControllers/JobController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.put('/updateJob/:jobId', JobController.updateJob);
router.delete('/deleteJob/:jobId', JobController.deleteJob);
router.post('/addJob/:companyId', JobController.addJob);
router.get('/getJobDetail/:jobId', JobController.getJobDetail);
router.get('/getJobByCompanyId/:companyId', JobController.getJobByCompanyId);
router.get('/getJobs', JobController.getJobs);
module.exports = router