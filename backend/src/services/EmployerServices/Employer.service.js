const EmployerRepository = require('../../repositories/EmployerRepositories/Employer.repository');
const EmployerCache = require('../../Cache/EmployerCache/Employer.cache');
const { AppError } = require('../../utils/errorHandler');

class EmployerService {
    /**
     * Get Company Info
     */
    static async getCompanyInfo(companyId) {
        // Try cache first
        const cached = await EmployerCache.getCachedCompanyInfo(companyId);
        if (cached) {
            console.log('Company info from cache:', companyId);
            return cached;
        }

        // Get from database
        const company = await EmployerRepository.getCompanyInfo(companyId);

        if (!company) {
            throw new AppError('Company not found', 404);
        }

        // Cache result
        await EmployerCache.cacheCompanyInfo(companyId, company);

        return company;
    }

    /**
     * Get All Companies (Admin)
     */
    static async getAllCompanies() {
        // Try cache first
        const cached = await EmployerCache.getCachedAllCompanies();
        if (cached) {
            console.log('All companies from cache');
            return cached;
        }

        // Get from database
        const companies = await EmployerRepository.getAllCompanies();

        if (!companies || companies.length === 0) {
            throw new AppError('No companies found', 404);
        }

        // Cache result
        await EmployerCache.cacheAllCompanies(companies);

        return companies;
    }

    /**
     * Get Verified Companies
     */
    static async getVerifiedCompanies() {
        // Try cache first
        const cached = await EmployerCache.getCachedVerifiedCompanies();
        if (cached) {
            console.log('Verified companies from cache');
            return cached;
        }

        // Get from database
        const companies = await EmployerRepository.getVerifiedCompanies();

        if (!companies || companies.length === 0) {
            throw new AppError('No verified companies found', 404);
        }

        // Cache result
        await EmployerCache.cacheVerifiedCompanies(companies);

        return companies;
    }

    /**
     * Verify Company (Admin)
     */
    static async verifyCompany(companyId) {
        const company = await EmployerRepository.verifyCompany(companyId);

        if (!company) {
            throw new AppError('Company not found or not updated', 404);
        }

        // Invalidate related caches
        await EmployerCache.invalidateCompanyCache(companyId);
        await EmployerCache.invalidateAllCompaniesCache();

        return company;
    }

    /**
     * Update Company Status
     */
    static async updateCompanyStatus(companyId, status) {
        const allowedStatus = ['accepted', 'rejected', 'pending'];

        if (!allowedStatus.includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const company = await EmployerRepository.updateCompanyStatus(companyId, status);

        if (!company) {
            throw new AppError('Company not found or not updated', 404);
        }

        // Invalidate related caches
        await EmployerCache.invalidateCompanyCache(companyId);
        await EmployerCache.invalidateAllCompaniesCache();

        return company;
    }

    /**
     * Get Companies by Status
     */
    static async getCompaniesByStatus(status) {
        const allowedStatus = ['accepted', 'rejected', 'pending'];

        if (!allowedStatus.includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const companies = await EmployerRepository.getCompaniesByStatus(status);

        return companies;
    }

    /**
     * Update Company Info
     */
    static async updateCompanyInfo(companyId, updateData) {
        const company = await EmployerRepository.updateCompanyInfo(companyId, updateData);

        if (!company) {
            throw new AppError('Company not found or not updated', 404);
        }

        // Invalidate related caches
        await EmployerCache.invalidateCompanyCache(companyId);
        await EmployerCache.invalidateAllCompaniesCache();

        return company;
    }

    /**
     * Upload Company Logo
     */
    static async uploadCompanyLogo(companyId, file) {
        if (!file) {
            throw new AppError('No file provided', 400);
        }

        // Get company info
        const company = await EmployerRepository.getCompanyInfo(companyId);
        if (!company) {
            throw new AppError('Company not found', 404);
        }

        // Upload file to Supabase Storage
        const fileName = `${companyId}_${Date.now()}_${file.originalname}`;
        const filePath = await EmployerRepository.uploadCompanyLogo(
            fileName,
            file.buffer,
            file.mimetype
        );

        // Get public URL
        const publicUrl = EmployerRepository.getPublicUrl('Company_Logo_Buckets', filePath);

        // Update company logo URL
        const updatedCompany = await EmployerRepository.updateCompanyLogoUrl(companyId, publicUrl);

        // Update user avatar
        await EmployerRepository.updateUserAvatar(companyId, publicUrl);

        // Invalidate caches
        await EmployerCache.invalidateCompanyCache(companyId);
        await EmployerCache.invalidateAllCompaniesCache();

        return {
            logo_url: publicUrl,
            company: updatedCompany
        };
    }

    /**
     * Update Company Name
     */
    static async updateCompanyName(companyId, companyName) {
        if (!companyName || companyName.trim() === '') {
            throw new AppError('Company name cannot be empty', 400);
        }

        const company = await EmployerRepository.updateCompanyName(companyId, companyName);

        if (!company) {
            throw new AppError('Company not found or not updated', 404);
        }

        // Update username in users table
        await EmployerRepository.updateUsername(companyId, companyName);

        // Invalidate caches
        await EmployerCache.invalidateCompanyCache(companyId);
        await EmployerCache.invalidateAllCompaniesCache();

        return company;
    }

    /**
     * Get Top Companies with Stats
     */
    static async getTopCompanies(limit = 10) {
        // Try cache first
        const cached = await EmployerCache.getCachedTopCompanies(limit);
        if (cached) {
            console.log('Top companies from cache, limit:', limit);
            return cached;
        }

        // Get from database
        const companies = await EmployerRepository.getTopCompaniesWithStats(limit);

        // Cache result
        await EmployerCache.cacheTopCompanies(limit, companies);

        return companies;
    }

    /**
     * Get Company Analytics
     */
    static async getCompanyAnalytics(companyId) {
        // Try cache first
        const cached = await EmployerCache.getCachedCompanyAnalytics(companyId);
        if (cached) {
            console.log('Company analytics from cache:', companyId);
            return cached;
        }

        // Get from database
        const analytics = await EmployerRepository.getCompanyAnalytics(companyId);

        if (!analytics) {
            throw new AppError('Company not found', 404);
        }

        // Cache result
        await EmployerCache.cacheCompanyAnalytics(companyId, analytics);

        return analytics;
    }
}

module.exports = EmployerService;
