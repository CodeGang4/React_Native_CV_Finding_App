const EmailRepository = require('../../repositories/EmployerRepositories/Email.repository');
const EmailCache = require('../../cache/EmployerCache/Email.cache');
const { AppError } = require('../../utils/errorHandler');
const sendEmailService = require('../sendEmailService');

class EmailService {
    /**
     * Send email to single or multiple recipients
     */
    static async sendEmail(companyId, emailData) {
        const {
            email,
            emails,
            email_type = 'formal',
            email_date_time = '',
            email_location = '',
            email_duration = ''
        } = emailData;

        // Check rate limit
        const canSend = await EmailCache.checkEmailRateLimit(companyId);
        if (!canSend) {
            const currentCount = await EmailCache.getEmailRateLimitCount(companyId);
            throw new AppError(`Rate limit exceeded. You have sent ${currentCount} emails in the last hour. Please try again later.`, 429);
        }

        // Get company info (with caching)
        let companyInfo = await EmailCache.getCachedCompanyInfo(companyId);
        if (!companyInfo) {
            companyInfo = await EmailRepository.getCompanyInfo(companyId);
            if (!companyInfo || !companyInfo.company_name) {
                throw new AppError('Company not found or company name is missing', 404);
            }
            await EmailCache.cacheCompanyInfo(companyId, companyInfo);
        }

        // Normalize emails to array
        let emailList = [];
        if (emails && Array.isArray(emails)) {
            emailList = emails;
        } else if (email) {
            emailList = Array.isArray(email) ? email : [email];
        }

        if (!emailList || emailList.length === 0) {
            throw new AppError('At least one email is required', 400);
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email.trim()));
        if (invalidEmails.length > 0) {
            throw new AppError('Invalid email format(s)', 400);
        }

        // Remove duplicates and trim
        emailList = [...new Set(emailList.map(email => email.trim()))];

        // Validate email type
        const validTypes = ['formal', 'friendly', 'online'];
        if (!validTypes.includes(email_type)) {
            throw new AppError('Invalid email type. Must be one of: formal, friendly, online', 400);
        }

        // Send emails concurrently
        const results = [];
        const errors = [];

        const emailPromises = emailList.map(async (recipientEmail) => {
            try {
                const response = await sendEmailService(
                    recipientEmail,
                    email_type,
                    email_date_time,
                    email_location,
                    companyInfo.company_name,
                    email_duration,
                    companyId
                );

                // Log successful email
                await EmailRepository.logEmailSent({
                    employer_id: companyId,
                    recipient_email: recipientEmail,
                    email_type,
                    subject: response.subject,
                    message_id: response.messageId,
                    status: 'sent',
                    metadata: {
                        date_time: email_date_time,
                        location: email_location,
                        duration: email_duration
                    }
                });

                return {
                    email: recipientEmail,
                    status: 'success',
                    ...response
                };
            } catch (error) {
                // Log failed email
                await EmailRepository.logEmailSent({
                    employer_id: companyId,
                    recipient_email: recipientEmail,
                    email_type,
                    status: 'failed',
                    metadata: { error: error.message }
                });

                return {
                    email: recipientEmail,
                    status: 'failed',
                    error: error.message
                };
            }
        });

        const emailResults = await Promise.allSettled(emailPromises);

        emailResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                if (result.value.status === 'success') {
                    results.push(result.value);
                } else {
                    errors.push(result.value);
                }
            } else {
                errors.push({
                    status: 'failed',
                    error: result.reason?.message || 'Unknown error'
                });
            }
        });

        // Invalidate stats cache
        await EmailCache.invalidateEmailCache(companyId);

        return {
            summary: {
                total: emailList.length,
                sent: results.length,
                failed: errors.length,
                companyName: companyInfo.company_name,
                emailType: email_type
            },
            results,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Send bulk emails with batching
     */
    static async sendBulkEmail(companyId, bulkData) {
        const {
            emails,
            email_type = 'formal',
            email_date_time = '',
            email_location = '',
            email_duration = '',
            batch_size = 10
        } = bulkData;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            throw new AppError('Emails array is required and must not be empty', 400);
        }

        // Check rate limit
        const canSend = await EmailCache.checkEmailRateLimit(companyId, emails.length);
        if (!canSend) {
            throw new AppError('Rate limit would be exceeded. Please reduce the number of emails or try again later.', 429);
        }

        // Get company info
        let companyInfo = await EmailCache.getCachedCompanyInfo(companyId);
        if (!companyInfo) {
            companyInfo = await EmailRepository.getCompanyInfo(companyId);
            if (!companyInfo?.company_name) {
                throw new AppError('Company not found', 404);
            }
            await EmailCache.cacheCompanyInfo(companyId, companyInfo);
        }

        // Normalize email data
        const emailList = emails
            .map((item) => {
                if (typeof item === 'string') {
                    return { email: item.trim(), name: '' };
                } else if (typeof item === 'object' && item.email) {
                    return { email: item.email.trim(), name: item.name || '' };
                }
                return null;
            })
            .filter(item => item && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email));

        if (emailList.length === 0) {
            throw new AppError('No valid emails found', 400);
        }

        const results = [];
        const errors = [];

        // Process emails in batches
        for (let i = 0; i < emailList.length; i += batch_size) {
            const batch = emailList.slice(i, i + batch_size);

            const batchPromises = batch.map(async (recipient) => {
                try {
                    const response = await sendEmailService(
                        recipient.email,
                        email_type,
                        email_date_time,
                        email_location,
                        companyInfo.company_name,
                        email_duration,
                        companyId
                    );

                    await EmailRepository.logEmailSent({
                        employer_id: companyId,
                        recipient_email: recipient.email,
                        recipient_name: recipient.name,
                        email_type,
                        subject: response.subject,
                        message_id: response.messageId,
                        status: 'sent'
                    });

                    return {
                        email: recipient.email,
                        name: recipient.name,
                        status: 'success',
                        messageId: response.messageId,
                        sentAt: new Date().toISOString()
                    };
                } catch (error) {
                    await EmailRepository.logEmailSent({
                        employer_id: companyId,
                        recipient_email: recipient.email,
                        recipient_name: recipient.name,
                        email_type,
                        status: 'failed',
                        metadata: { error: error.message }
                    });

                    return {
                        email: recipient.email,
                        name: recipient.name,
                        status: 'failed',
                        error: error.message,
                        attemptedAt: new Date().toISOString()
                    };
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    if (result.value.status === 'success') {
                        results.push(result.value);
                    } else {
                        errors.push(result.value);
                    }
                }
            });

            // Delay between batches
            if (i + batch_size < emailList.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Invalidate cache
        await EmailCache.invalidateEmailCache(companyId);

        return {
            summary: {
                total: emailList.length,
                sent: results.length,
                failed: errors.length,
                successRate: `${((results.length / emailList.length) * 100).toFixed(1)}%`,
                companyName: companyInfo.company_name,
                emailType: email_type,
                processedAt: new Date().toISOString()
            },
            results,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Get email sending history
     */
    static async getEmailHistory(employerId, limit = 50) {
        return await EmailRepository.getEmailHistory(employerId, limit);
    }

    /**
     * Get email statistics
     */
    static async getEmailStats(employerId) {
        // Try cache first
        let stats = await EmailCache.getCachedEmailStats(employerId);
        if (stats) {
            return stats;
        }

        // Get from database
        stats = await EmailRepository.getEmailStats(employerId);

        // Cache result
        await EmailCache.cacheEmailStats(employerId, stats);

        return stats;
    }
}

module.exports = EmailService;
