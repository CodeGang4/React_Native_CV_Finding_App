const EmployerService = require('../../services/EmployerServices/Employer.service');
const { asyncHandler } = require('../../utils/asyncHandler');
const { sendData } = require('../../utils/response');

class EmployerController {
    getCompanyInfo = asyncHandler(async (req, res) => {
        const company = await EmployerService.getCompanyInfo(req.params.companyId);
        sendData(res, company, 200);
    });

    getAllCompany = asyncHandler(async (req, res) => {
        const companies = await EmployerService.getAllCompanies();
        sendData(res, companies, 200);
    });

    getVerifiedCompany = asyncHandler(async (req, res) => {
        const companies = await EmployerService.getVerifiedCompanies();
        sendData(res, companies, 200);
    });

    verifyCompany = asyncHandler(async (req, res) => {
        const company = await EmployerService.verifyCompany(req.params.companyId);
        sendData(res, company, 200);
    });

    updateStatusCompany = asyncHandler(async (req, res) => {
        const company = await EmployerService.updateCompanyStatus(req.params.companyId, req.body.status);
        sendData(res, company, 200);
    });

    getCompanyWithStatus = asyncHandler(async (req, res) => {
        const companies = await EmployerService.getCompaniesByStatus(req.params.status);
        sendData(res, companies, 200);
    });

    updateInfo = asyncHandler(async (req, res) => {
        const company = await EmployerService.updateCompanyInfo(req.params.companyId, req.body);
        sendData(res, company, 200);
    });

    uploadCompanyLogo = asyncHandler(async (req, res) => {
        const result = await EmployerService.uploadCompanyLogo(req.params.companyId, req.file);
        sendData(res, result, 200);
    });

    updateCompanyName = asyncHandler(async (req, res) => {
        const company = await EmployerService.updateCompanyName(req.params.companyId, req.body.company_name);
        sendData(res, company, 200);
    });

    getTopCompanies = asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.number) || 10;
        const companies = await EmployerService.getTopCompanies(limit);
        sendData(res, companies, 200);
    });

    CompanyAnalytics = asyncHandler(async (req, res) => {
        const analytics = await EmployerService.getCompanyAnalytics(req.params.companyId);
        sendData(res, analytics, 200);
    });
}

module.exports = new EmployerController();
