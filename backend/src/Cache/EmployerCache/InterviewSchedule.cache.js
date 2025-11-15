const redis = require('../../redis/config');

class InterviewScheduleCache {
    /**
     * Cache company schedules
     */
    static async cacheCompanySchedules(employerId, schedules) {
        try {
            const key = `interview_schedules:employer:${employerId}`;
            await redis.setEx(key, 1800, JSON.stringify(schedules)); // 30 minutes TTL
        } catch (error) {
            console.error('Error caching company schedules:', error);
        }
    }

    static async getCachedCompanySchedules(employerId) {
        try {
            const key = `interview_schedules:employer:${employerId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached company schedules:', error);
            return null;
        }
    }

    /**
     * Cache single schedule
     */
    static async cacheSchedule(scheduleId, schedule) {
        try {
            const key = `interview_schedule:${scheduleId}`;
            await redis.setEx(key, 1800, JSON.stringify(schedule)); // 30 minutes TTL
        } catch (error) {
            console.error('Error caching schedule:', error);
        }
    }

    static async getCachedSchedule(scheduleId) {
        try {
            const key = `interview_schedule:${scheduleId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached schedule:', error);
            return null;
        }
    }

    /**
     * Cache candidate schedules
     */
    static async cacheCandidateSchedules(candidateId, schedules) {
        try {
            const key = `interview_schedules:candidate:${candidateId}`;
            await redis.setEx(key, 1800, JSON.stringify(schedules)); // 30 minutes TTL
        } catch (error) {
            console.error('Error caching candidate schedules:', error);
        }
    }

    static async getCachedCandidateSchedules(candidateId) {
        try {
            const key = `interview_schedules:candidate:${candidateId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached candidate schedules:', error);
            return null;
        }
    }

    /**
     * Cache schedules by status
     */
    static async cacheSchedulesByStatus(employerId, status, schedules) {
        try {
            const key = `interview_schedules:employer:${employerId}:status:${status}`;
            await redis.setEx(key, 1800, JSON.stringify(schedules)); // 30 minutes TTL
        } catch (error) {
            console.error('Error caching schedules by status:', error);
        }
    }

    static async getCachedSchedulesByStatus(employerId, status) {
        try {
            const key = `interview_schedules:employer:${employerId}:status:${status}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached schedules by status:', error);
            return null;
        }
    }

    /**
     * Invalidate schedule cache
     */
    static async invalidateScheduleCache(employerId, candidateId = null, scheduleId = null) {
        try {
            const keys = [
                `interview_schedules:employer:${employerId}`,
                `interview_schedules:employer:${employerId}:status:scheduled`,
                `interview_schedules:employer:${employerId}:status:completed`,
                `interview_schedules:employer:${employerId}:status:canceled`
            ];
            
            if (candidateId) {
                keys.push(`interview_schedules:candidate:${candidateId}`);
            }
            
            if (scheduleId) {
                keys.push(`interview_schedule:${scheduleId}`);
            }
            
            for (const key of keys) {
                await redis.del(key);
            }
        } catch (error) {
            console.error('Error invalidating schedule cache:', error);
        }
    }
}

module.exports = InterviewScheduleCache;
