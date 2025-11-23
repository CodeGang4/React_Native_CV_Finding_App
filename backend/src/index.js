const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const redisClient = require('./redis/config');

app.use(async (req, res, next) => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis reconnected');
        }
        next();
    } catch (err) {
        console.error('Redis reconnection error', err);
        next();
    }
});

require('dotenv').config();

const route = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middlewares
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
        },
    })
);


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased from 100 to 500 requests per 15 minutes
    message: "Too many requests, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use(limiter);
route(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Listen on all network interfaces

app.listen(port, host, () => {
    console.log(`Server is running on:`);
    console.log(`  - Local:   http://localhost:${port}`);
    console.log(`  - Network: http://172.20.x.x:${port}`);
    console.log(`  - Network: http://192.168.x.x:${port} (if connected to WiFi)`);
});