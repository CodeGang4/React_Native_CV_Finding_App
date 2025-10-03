const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const EmployerController = require('../../controllers/EmployerControllers/EmployerController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.patch(
    '/updateCompanyName/:companyId',
    EmployerController.updateCompanyName,
);
router.patch('/verified/:companyId', EmployerController.verifyCompany);
router.post(
    '/uploadCompanyLogo/:companyId',
    upload.single('companyLogo'),
    EmployerController.uploadCompanyLogo,
);
router.put('/updateInfor/:companyId', EmployerController.updateInfo);
router.get('/getCompanyInfo/:companyId', EmployerController.getCompanyInfo);
router.get('/getAllCompany', EmployerController.getAllCompany);
router.get('/getVerifiedCompany', EmployerController.getVerifiedCompany);

module.exports = router;
