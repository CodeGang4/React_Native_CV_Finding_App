
const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;

const noopClient = {
    isConnected: false,
    async get() { return null; },
    async setEx() { return null; },
    async set() { return null; },
    async del() { return null; },
    on() { },
    quit() { },
    disconnect() { }
};

let client = noopClient;

if (!redisUrl) {
    console.warn('REDIS_URL not set. Using no-op Redis client.');
} else {
    try {
        client = createClient({ 
            url: redisUrl,
            socket: {
                reconnectStrategy: false, 
                connectTimeout: 5000,  
            }
        });

        let errorLogged = false;
        client.on('error', (err) => {
            if (!errorLogged) {
                console.error('Redis connection failed:', err.code || err.message);
                console.warn('Falling back to no-op Redis client. Fix REDIS_URL to enable Redis.');
                errorLogged = true;
            }
        });

        // Try to connect once
        (async () => {
            try {
                await client.connect();
                client.isConnected = true;
                console.log('Redis connected');
            } catch (err) {
                client.isConnected = false;
                await client.quit().catch(() => {}); 
                client = noopClient;
                console.error('Redis connection failed:', err.code || err.message);
                console.warn('Using no-op Redis client. Fix REDIS_URL to enable Redis.');
            }
        })();

    } catch (err) {
        console.error('Redis client creation failed:', err.message);
        client = noopClient;
    }
}

module.exports = client;
