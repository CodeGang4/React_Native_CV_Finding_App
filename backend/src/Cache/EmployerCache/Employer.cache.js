const redis = require('../../redis/config');

class EmployerCache {
    /**
     * Cache company info
     */
    async cacheCompanyInfo(companyId, companyData) {
        try {
            await redis.setEx(
                `company:${companyId}`,
                3600, // 1 hour
                JSON.stringify(companyData)
            );
        } catch (error) {
            console.error('Cache company info error:', error);
        }
    }

    /**
     * Get cached company info
     */
    async getCachedCompanyInfo(companyId) {
        try {
            const cached = await redis.get(`company:${companyId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached company info error:', error);
            return null;
        }
    }

    /**
     * Cache all companies
     */
    async cacheAllCompanies(companies) {
        try {
            await redis.setEx(
                'all_companies',
                1800, // 30 minutes
                JSON.stringify(companies)
            );
        } catch (error) {
            console.error('Cache all companies error:', error);
        }
    }

    /**
     * Get cached all companies
     */
    async getCachedAllCompanies() {
        try {
            const cached = await redis.get('all_companies');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached all companies error:', error);
            return null;
        }
    }

    /**
     * Cache verified companies
     */
    async cacheVerifiedCompanies(companies) {
        try {
            await redis.setEx(
                'verified_companies',
                1800, // 30 minutes
                JSON.stringify(companies)
            );
        } catch (error) {
            console.error('Cache verified companies error:', error);
        }
    }

    /**
     * Get cached verified companies
     */
    async getCachedVerifiedCompanies() {
        try {
            const cached = await redis.get('verified_companies');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached verified companies error:', error);
            return null;
        }
    }

    /**
     * Cache top companies
     */
    async cacheTopCompanies(companies, number) {
        try {
            await redis.setEx(
                `top_companies:${number}`,
                1800, // 30 minutes
                JSON.stringify(companies)
            );
        } catch (error) {
            console.error('Cache top companies error:', error);
        }
    }

    /**
     * Get cached top companies
     */
    async getCachedTopCompanies(number) {
        try {
            const cached = await redis.get(`top_companies:${number}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached top companies error:', error);
            return null;
        }
    }

    /**
     * Cache company analytics
     */
    async cacheCompanyAnalytics(companyId, analyticsData) {
        try {
            await redis.setEx(
                `company_analytics:${companyId}`,
                1800, // 30 minutes
                JSON.stringify(analyticsData)
            );
        } catch (error) {
            console.error('Cache company analytics error:', error);
        }
    }

    /**
     * Get cached company analytics
     */
    async getCachedCompanyAnalytics(companyId) {
        try {
            const cached = await redis.get(`company_analytics:${companyId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get cached company analytics error:', error);
            return null;
        }
    }

    /**
     * Invalidate company cache
     */
    async invalidateCompanyCache(companyId) {
        try {
            await redis.del(`company:${companyId}`);
            await redis.del(`company_analytics:${companyId}`);
            await redis.del('all_companies');
            await redis.del('verified_companies');
            // Delete all top_companies keys
            const keys = await redis.keys('top_companies:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Invalidate company cache error:', error);
        }
    }

    /**
     * Invalidate all companies cache
     */
    async invalidateAllCompaniesCache() {
        try {
            await redis.del('all_companies');
            await redis.del('verified_companies');
            const keys = await redis.keys('top_companies:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Invalidate all companies cache error:', error);
        }
    }
}

module.exports = new EmployerCache();
