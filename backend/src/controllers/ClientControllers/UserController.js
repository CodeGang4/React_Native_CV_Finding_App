const UserService = require('../../services/ClientServices/User.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class UserController {
    getUserProfile = asyncHandler(async (req, res) => {
        const user = await UserService.getUserProfile(req.params.userId);
        sendData(res, { user }, 200);
    });

    updateUserRole = asyncHandler(async (req, res) => {
        const user = await UserService.updateUserRole(req.params.userId, req.body.role);
        sendData(res, { user }, 200);
    });

    updateProfile = asyncHandler(async (req, res) => {
        const profile = await UserService.updateCandidateProfile(req.params.userId, req.body);
        sendData(res, profile, 200);
    });

    uploadCV = asyncHandler(async (req, res) => {
        const result = await UserService.uploadCV(req.params.userId, req.file);
        sendData(res, result, 200);
    });

    uploadPortfolio = asyncHandler(async (req, res) => {
        const result = await UserService.uploadPortfolio(req.params.userId, req.file);
        sendData(res, result, 200);
    });
}

module.exports = new UserController();
