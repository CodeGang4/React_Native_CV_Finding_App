const AuthService = require('../../services/ClientServices/Auth.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class AuthController {
    register = asyncHandler(async (req, res) => {
        const { email, password, recheckPassword, username, role = 'candidate' } = req.body;
        const result = await AuthService.register(email, password, recheckPassword, username, role);
        return sendData(res, result, 201);
    });

    login = asyncHandler(async (req, res) => {
        const { email, password, role = 'candidate' } = req.body;
        const result = await AuthService.login(email, password, role);
        return sendData(res, result);
    });

    logout = asyncHandler(async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        const result = await AuthService.logout(token);
        return sendData(res, result);
    });

    checkCandidates = asyncHandler(async (req, res) => {
        const result = await AuthService.getAllCandidates();
        return sendData(res, result);
    });

    checkUsers = asyncHandler(async (req, res) => {
        const result = await AuthService.getAllUsers();
        return sendData(res, result);
    });
}

module.exports = new AuthController();
