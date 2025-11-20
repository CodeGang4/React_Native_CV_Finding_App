const AddressService = require('../../services/EmployerServices/Address.service');
const { sendData } = require('../../utils/response');
const { asyncHandler } = require('../../utils/errorHandler');

class AddressController {
    /**
     * Find jobs within radius from user location
     * POST /api/address/nearby
     * Body: { latitude, longitude, radius }
     */
    findJobsByRadius = asyncHandler(async (req, res) => {
        const { latitude, longitude, radius = 5 } = req.body;
        const jobs = await AddressService.findJobsByRadius(latitude, longitude, radius);
        sendData(res, {
            jobs,
            count: jobs.length,
            radius: `${radius}km`,
            userLocation: { latitude, longitude }
        }, 200);
    });

    geocodeAddress = asyncHandler(async (req, res) => {
        const { job_id } = req.params;
        const addressData = await AddressService.geocodeAddress(job_id);
        sendData(res, addressData, 200);
    });

    getAddress = asyncHandler(async (req, res) => {
        const { job_id } = req.params;
        const addressData = await AddressService.getAddressById(job_id);
        sendData(res, addressData, 200);
    });
}

module.exports = new AddressController();