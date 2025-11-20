const express = require('express');

const AddressController = require('../../controllers/EmployerControllers/AddressController');

const router = express.Router();

// Find jobs within radius from user location
router.post('/nearby', AddressController.findJobsByRadius);

// Geocode and get address endpoints
router.post('/:job_id', AddressController.geocodeAddress);
router.get('/:job_id', AddressController.getAddress);

module.exports = router;