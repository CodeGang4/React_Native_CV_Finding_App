// Redis temporarily disabled to prevent connection errors
// const { createClient } = require('redis');
// require('dotenv').config();

// const client = createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
//     },
// });

// client.on('error', err => console.error('Redis Client Error', err));

// (async () => {
//     try {
//         await client.connect();
//         console.log('Redis connected');
//     } catch (err) {
//         console.error('Redis connection error', err);
//     }
// })();

// Mock Redis client to prevent errors in controllers
const mockRedis = {
    setEx: async (key, ttl, value) => {
        console.log(`[MOCK REDIS] setEx: ${key} = ${value} (TTL: ${ttl}s)`);
        return Promise.resolve('OK');
    },
    set: async (key, value) => {
        console.log(`[MOCK REDIS] set: ${key} = ${value}`);
        return Promise.resolve('OK');
    },
    get: async (key) => {
        console.log(`[MOCK REDIS] get: ${key}`);
        return Promise.resolve(null);
    },
    del: async (key) => {
        console.log(`[MOCK REDIS] del: ${key}`);
        return Promise.resolve(1);
    },
    exists: async (key) => {
        console.log(`[MOCK REDIS] exists: ${key}`);
        return Promise.resolve(0);
    },
    expire: async (key, ttl) => {
        console.log(`[MOCK REDIS] expire: ${key} (TTL: ${ttl}s)`);
        return Promise.resolve(1);
    },
    flushAll: async () => {
        console.log(`[MOCK REDIS] flushAll`);
        return Promise.resolve('OK');
    },
};

module.exports = mockRedis;
