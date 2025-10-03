// middleware/redisCache.js - Redis caching disabled
const redis = require('../redis/config');

const cacheMiddleware = (keyFn, ttl = 60) => {
    return async (req, res, next) => {
        console.log(
            '[CACHE MIDDLEWARE] Redis caching disabled - bypassing cache',
        );

        // Simply call next() to bypass caching
        next();
    };
};

module.exports = { cacheMiddleware };
