/**
 * Custom Application Error Class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler Middleware
 * @param {Error} error
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const errorHandler = (error, req, res, next) => {
    let { statusCode, message } = error;

    // Default to 500 if statusCode is not set
    statusCode = statusCode || 500;

    // Log error for debugging
    console.error("Error:", {
        statusCode,
        message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message: message || "Internal Server Error",
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        },
    });
};

/**
 * Async Handler Wrapper - Catches async errors and passes to error handler
 * @param {Function} fn
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    notFoundHandler,
};
