const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/ClientControllers/AuthController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/google-login', AuthController.googleLogin)

module.exports = router