/**
 * Standard API Response Utilities
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Obkject} statusCode - status code
 */
const sendData = (res, data, statusCode = 200) => {
    return res.status(statusCode).json(data);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 */
const sendError = (res, message = "Error", statusCode = 500, details = null) => {
    const response = {
        success: false,
        error: {
            message,
        },
    };

    if (details) {
        response.error.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const sendPaginated = (
    res,
    data,
    pagination = {},
    message = "Success",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || data.length,
            totalPages: pagination.totalPages || 1,
        },
    });
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = "Resource created successfully") => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginated,
    sendCreated,
    sendNoContent,
    sendData
};
