const redis = require('../../redis/config');

const JOB_PREFIX = 'job_address:';

class AddressCache {
    constructor() {
        this.TTL = 3600; // 1 hour
        this.APPLICATION_TTL = 86400; // 24 hours
    }


    async checkAddressInCache(job_id) {
        try{
            const cached = await redis.get(`${JOB_PREFIX}${job_id}`);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error('Check address in cache error:', error);
            return null;
        }
    }

    async getAddressFromCache(job_id) {
        try {
            const cached = await redis.get(`${JOB_PREFIX}${job_id}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Get address from cache error:', error);
            return null;
        }
    }

    async cacheAddress(job_id, addressData) {
        try {
            await redis.setEx(
                `${JOB_PREFIX}${job_id}`,
                this.TTL,
                JSON.stringify(addressData)
            );
        } catch (error) {
            console.error('Cache address error:', error);
        }
    }
}

module.exports = new AddressCache();