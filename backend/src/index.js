const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
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
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // tối đa 100 request / IP trong 15 phút
    message: "Too many requests, please try again later.",
    standardHeaders: true, // gửi thông tin giới hạn trong header
    legacyHeaders: false,  // tắt x-ratelimit-*
});
app.use(limiter);
route(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});