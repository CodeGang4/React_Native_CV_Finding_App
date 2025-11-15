const redis = require('../../redis/config');

class EmailTemplateCache {
    /**
     * Cache employer templates
     */
    static async cacheEmployerTemplates(employerId, templates) {
        try {
            const key = `email_templates:employer:${employerId}`;
            await redis.setEx(key, 3600, JSON.stringify(templates)); // 1 hour TTL
        } catch (error) {
            console.error('Error caching employer templates:', error);
        }
    }

    static async getCachedEmployerTemplates(employerId) {
        try {
            const key = `email_templates:employer:${employerId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached employer templates:', error);
            return null;
        }
    }

    /**
     * Cache default templates
     */
    static async cacheDefaultTemplates(templates) {
        try {
            const key = 'email_templates:default';
            await redis.setEx(key, 7200, JSON.stringify(templates)); // 2 hours TTL
        } catch (error) {
            console.error('Error caching default templates:', error);
        }
    }

    static async getCachedDefaultTemplates() {
        try {
            const key = 'email_templates:default';
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached default templates:', error);
            return null;
        }
    }

    /**
     * Cache single template
     */
    static async cacheTemplate(templateId, template) {
        try {
            const key = `email_template:${templateId}`;
            await redis.setEx(key, 3600, JSON.stringify(template)); // 1 hour TTL
        } catch (error) {
            console.error('Error caching template:', error);
        }
    }

    static async getCachedTemplate(templateId) {
        try {
            const key = `email_template:${templateId}`;
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error getting cached template:', error);
            return null;
        }
    }

    /**
     * Invalidate template cache
     */
    static async invalidateTemplateCache(employerId, templateId = null) {
        try {
            const keys = [`email_templates:employer:${employerId}`];
            
            if (templateId) {
                keys.push(`email_template:${templateId}`);
            }
            
            for (const key of keys) {
                await redis.del(key);
            }
        } catch (error) {
            console.error('Error invalidating template cache:', error);
        }
    }

    /**
     * Invalidate all template caches
     */
    static async invalidateAllTemplateCaches() {
        try {
            // Get all template keys
            const employerKeys = await redis.keys('email_templates:employer:*');
            const templateKeys = await redis.keys('email_template:*');
            const defaultKey = 'email_templates:default';
            
            const allKeys = [...employerKeys, ...templateKeys, defaultKey];
            
            if (allKeys.length > 0) {
                for (const key of allKeys) {
                    await redis.del(key);
                }
            }
        } catch (error) {
            console.error('Error invalidating all template caches:', error);
        }
    }
}

module.exports = EmailTemplateCache;
