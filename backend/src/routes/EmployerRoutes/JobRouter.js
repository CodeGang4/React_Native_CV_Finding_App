const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../../middlewares/redisCache');
const JobController = require('../../controllers/EmployerControllers/JobController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/hideJob/:candidate_id/:jobId', JobController.hideJobForUser);
router.post('/views/:jobId', JobController.incrementJobViews);
router.put('/updateJob/:jobId', JobController.updateJob);
router.delete('/deleteJob/:jobId', JobController.deleteJob);
router.post('/addJob/:companyId', JobController.createJob);
router.get('/getHiddenJobs/:candidate_id', JobController.getHiddenJobsForUser);
router.get('/getJobDetail/:jobId', JobController.getJobDetails);
router.get('/getTopJobs', JobController.getTopViewedJobs);
router.get('/getJobByCompanyId/:companyId', JobController.getJobByCompanyId);
router.get('/getJobs', JobController.getJobs);
module.exports = router;
