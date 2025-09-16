const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
    },
});

client.on('error', err => console.error('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log('Redis connected');
    } catch (err) {
        console.error('Redis connection error', err);
    }
})();

module.exports = client;