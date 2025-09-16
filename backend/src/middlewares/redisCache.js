// middleware/redisCache.js
const redis = require("../redis/config");

const cacheMiddleware = (keyFn, ttl = 60) => {
    return async (req, res, next) => {
        try {
            // keyFn có thể là string hoặc function tạo key từ req
            const cacheKey =
                typeof keyFn === "function" ? keyFn(req) : keyFn || req.originalUrl;

            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log(`🔹 Cache hit: ${cacheKey}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            // Ghi đè res.json để cache data khi gửi response
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                redis.setEx(cacheKey, ttl, JSON.stringify(data));
                return originalJson(data);
            };

            next();
        } catch (err) {
            console.error("Redis cache error:", err);
            next();
        }
    };
};

module.exports = { cacheMiddleware };
