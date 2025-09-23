const nodemailer = require('nodemailer');
const sendEmailService = require('../../services/sendEmailService');
const supabase = require('../../supabase/config');
class EmailController {
    async sendEmail(req, res) {
        const companyId = req.params.companyId;
        console.log('Received companyId:', companyId);

        if (!companyId) {
            return res
                .status(400)
                .json({ message: 'Company ID is required in URL params' });
        }

        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
            .from('employers')
            .select('company_name')
            .eq('user_id', companyId)
            .single();

        if (companyError) {
            console.error('Error fetching company data:', companyError);
            return res.status(500).json({
                message: 'Failed to fetch company data',
                error: companyError.message,
            });
        }

        if (!companyData || !companyData.company_name) {
            return res.status(404).json({
                message: 'Company not found or company name is missing',
            });
        }

        console.log('Found company:', companyData.company_name);

        const {
            email, // có thể là string hoặc array
            emails, // array of emails (alternative)
            email_type = 'formal',
            email_date_time = '',
            email_location = '',
            email_duration = '',
        } = req.body;

        // Normalize emails to array
        let emailList = [];
        if (emails && Array.isArray(emails)) {
            emailList = emails;
        } else if (email) {
            emailList = Array.isArray(email) ? email : [email];
        }

        console.log('Email request data:', {
            emailList,
            email_type,
            email_date_time,
            email_location,
            email_duration,
        });

        if (!emailList || emailList.length === 0) {
            return res
                .status(400)
                .json({ message: 'At least one email is required' });
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(
            (email) => !emailRegex.test(email.trim()),
        );
        if (invalidEmails.length > 0) {
            return res.status(400).json({
                message: 'Invalid email format(s)',
                invalidEmails: invalidEmails,
            });
        }

        // Remove duplicates and trim
        emailList = [...new Set(emailList.map((email) => email.trim()))];

        console.log('Cleaned email list:', emailList);

        // Validate email_type
        const validTypes = ['formal', 'friendly', 'online'];
        if (!validTypes.includes(email_type)) {
            return res.status(400).json({
                message:
                    'Invalid email type. Must be one of: formal, friendly, online',
            });
        }

        try {
            console.log(
                'Sending emails to multiple recipients:',
                emailList.length,
            );

            const results = [];
            const errors = [];

            // Send emails concurrently using Promise.allSettled
            const emailPromises = emailList.map(
                async (recipientEmail, index) => {
                    try {
                        console.log(
                            `Sending email ${index + 1}/${emailList.length} to: ${recipientEmail}`,
                        );

                        const response = await sendEmailService(
                            recipientEmail,
                            email_type,
                            email_date_time,
                            email_location,
                            companyData.company_name,
                            email_duration,
                            companyId, // Thêm companyId để lấy template từ DB
                        );

                        return {
                            email: recipientEmail,
                            status: 'success',
                            ...response,
                        };
                    } catch (error) {
                        console.error(
                            `Failed to send email to ${recipientEmail}:`,
                            error,
                        );
                        return {
                            email: recipientEmail,
                            status: 'failed',
                            error: error.message,
                        };
                    }
                },
            );

            const emailResults = await Promise.allSettled(emailPromises);

            // Process results
            emailResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    if (result.value.status === 'success') {
                        results.push(result.value);
                    } else {
                        errors.push(result.value);
                    }
                } else {
                    errors.push({
                        email: emailList[index],
                        status: 'failed',
                        error: result.reason?.message || 'Unknown error',
                    });
                }
            });

            const totalSent = results.length;
            const totalFailed = errors.length;
            const totalEmails = emailList.length;

            console.log(
                `Email batch completed: ${totalSent}/${totalEmails} sent successfully`,
            );

            return res.status(200).json({
                success: totalSent > 0,
                summary: {
                    total: totalEmails,
                    sent: totalSent,
                    failed: totalFailed,
                    companyName: companyData.company_name,
                    emailType: email_type,
                },
                results: results,
                errors: errors.length > 0 ? errors : undefined,
            });
        } catch (error) {
            console.error('Email batch sending failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send emails',
                error: error.message,
            });
        }
    }

    async sendBulkEmail(req, res) {
        const companyId = req.params.companyId;
        console.log('Received bulk email request for companyId:', companyId);

        if (!companyId) {
            return res
                .status(400)
                .json({ message: 'Company ID is required in URL params' });
        }

        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
            .from('employers')
            .select('company_name')
            .eq('user_id', companyId)
            .single();

        if (companyError || !companyData?.company_name) {
            console.error('Error fetching company data:', companyError);
            return res.status(500).json({
                message: 'Failed to fetch company data',
                error: companyError?.message || 'Company not found',
            });
        }

        const {
            emails, // array of email objects [{email, name}, ...] or simple email strings
            email_type = 'formal',
            email_date_time = '',
            email_location = '',
            email_duration = '',
            batch_size = 10, // số email gửi cùng lúc để tránh rate limit
        } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res
                .status(400)
                .json({
                    message: 'Emails array is required and must not be empty',
                });
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
            .filter(
                (item) => item && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email),
            );

        if (emailList.length === 0) {
            return res.status(400).json({ message: 'No valid emails found' });
        }

        console.log(`Processing bulk email for ${emailList.length} recipients`);

        try {
            const results = [];
            const errors = [];

            // Process emails in batches to avoid overwhelming the SMTP server
            for (let i = 0; i < emailList.length; i += batch_size) {
                const batch = emailList.slice(i, i + batch_size);
                console.log(
                    `Processing batch ${Math.floor(i / batch_size) + 1}/${Math.ceil(emailList.length / batch_size)}`,
                );

                const batchPromises = batch.map(async (recipient) => {
                    try {
                        const response = await sendEmailService(
                            recipient.email,
                            email_type,
                            email_date_time,
                            email_location,
                            companyData.company_name,
                            email_duration,
                            companyId, // Thêm companyId
                        );

                        return {
                            email: recipient.email,
                            name: recipient.name,
                            status: 'success',
                            messageId: response.messageId,
                            sentAt: new Date().toISOString(),
                        };
                    } catch (error) {
                        return {
                            email: recipient.email,
                            name: recipient.name,
                            status: 'failed',
                            error: error.message,
                            attemptedAt: new Date().toISOString(),
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

                // Small delay between batches to be respectful to SMTP server
                if (i + batch_size < emailList.length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            const summary = {
                total: emailList.length,
                sent: results.length,
                failed: errors.length,
                successRate: `${((results.length / emailList.length) * 100).toFixed(1)}%`,
                companyName: companyData.company_name,
                emailType: email_type,
                processedAt: new Date().toISOString(),
            };

            console.log('Bulk email completed:', summary);

            return res.status(200).json({
                success: results.length > 0,
                summary,
                results,
                errors: errors.length > 0 ? errors : undefined,
            });
        } catch (error) {
            console.error('Bulk email processing failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process bulk emails',
                error: error.message,
            });
        }
    }
}

module.exports = new EmailController();
