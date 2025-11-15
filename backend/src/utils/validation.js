/**
 * Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format (basic)
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate UUID format
 * @param {string} uuid
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Sanitize string input
 * @param {string} input
 * @returns {string}
 */
const sanitizeString = (input) => {
    if (typeof input !== "string") return "";
    return input.trim().replace(/[<>]/g, "");
};

/**
 * Check if value is empty
 * @param {*} value
 * @returns {boolean}
 */
const isEmpty = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
    );
};

/**
 * Validate required fields
 * @param {Object} data
 * @param {Array} requiredFields
 * @returns {Object} - { isValid: boolean, missing: Array }
 */
const validateRequiredFields = (data, requiredFields) => {
    const missing = [];

    for (const field of requiredFields) {
        if (isEmpty(data[field])) {
            missing.push(field);
        }
    }

    return {
        isValid: missing.length === 0,
        missing,
    };
};

/**
 * Validate number range
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
const isInRange = (value, min, max) => {
    return !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidUUID,
    validatePassword,
    sanitizeString,
    isEmpty,
    validateRequiredFields,
    isInRange,
    isValidURL,
};
