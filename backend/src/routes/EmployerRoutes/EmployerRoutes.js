const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const EmployerController = require('../../controllers/EmployerControllers/EmployerController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/uploadCompanyLogo/:companyId', upload.single('companyLogo'), EmployerController.uploadCompanyLogo);
router.post('/updateInfor/:companyId', EmployerController.updateInfo);


module.exports = router