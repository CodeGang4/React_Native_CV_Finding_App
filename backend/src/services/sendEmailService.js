const nodemailer = require('nodemailer');
const EmailTemplateService = require('./EmailTemplateService');

async function sendEmailService(
    toEmail,
    emailType = 'formal',
    emailDateTime = '',
    emailLocation = '',
    companyName = '',
    emailDuration = '',
    employerId = null,
) {
    // Cấu hình transporter với Gmail
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Verify transporter
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
    } catch (error) {
        console.error('SMTP verification failed:', error);
        throw new Error(`SMTP configuration error: ${error.message}`);
    }

    // Lấy template từ database
    let templateData = null;
    let subject = '';
    let htmlContent = '';

    try {
        console.log(
            `Fetching email template for type: ${emailType}, employer: ${employerId || 'default'}`,
        );

        // Lấy template từ database
        templateData = await EmailTemplateService.getTemplate(
            emailType,
            employerId,
        );

        if (!templateData) {
            throw new Error(`Template not found for type: ${emailType}`);
        }

        // Chuẩn bị variables để thay thế trong template
        const templateVariables = {
            toEmail: toEmail,
            companyName: companyName,
            emailDateTime: emailDateTime || '[Ngày giờ phỏng vấn]',
            emailLocation: emailLocation || '[Địa chỉ phỏng vấn]',
            emailDuration: emailDuration || '[Thời gian phỏng vấn]',
            emailType: emailType,
        };

        // Xử lý subject từ template
        subject = EmailTemplateService.processTemplate(
            templateData.subject || `Email từ ${companyName}`,
            templateVariables,
        );

        // Xử lý HTML template
        htmlContent = EmailTemplateService.processTemplate(
            templateData.template || '',
            templateVariables,
        );

        console.log('Template processed successfully from database');
    } catch (error) {
        console.error('Error processing email template:', error);

        // Fallback to default template nếu có lỗi
        console.log('Using fallback template');
        const { EmailTemplate } = require('../templates/EmailTemplates');
        htmlContent = EmailTemplate(
            toEmail,
            emailType,
            emailDateTime,
            emailLocation,
            emailDuration,
            companyName,
        );
        subject = `Lời mời phỏng vấn từ ${companyName}`;
        templateData = { id: 'fallback', template: 'fallback' };
    }

    // Set up email data với template
    let mailOptions = {
        from: `"<${companyName}>" <${process.env.EMAIL_USERNAME}>`, // sender address
        to: toEmail, // list of receivers
        subject: subject, // Subject line
        text: `Lời mời phỏng vấn từ ${companyName}\n\nThời gian: ${emailDateTime || '[Sẽ được thông báo]'}\nĐịa điểm: ${emailLocation || '[Sẽ được thông báo]'}\n\nVui lòng kiểm tra email HTML để xem chi tiết.`,
        html: htmlContent, // html body từ template
    };

    try {
        // Send mail with defined transport object
        console.log(`Attempting to send ${emailType} email to: ${toEmail}`);
        let info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Email Type:', emailType);

        return {
            message: 'Email sent successfully',
            messageId: info.messageId,
            recipient: toEmail,
            location: emailLocation,
            duration: emailDuration,
            emailType: emailType,
            subject: subject,
            templateId: templateData?.id || 'fallback',
            templateSource: templateData ? 'database' : 'fallback',
        };
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

module.exports = sendEmailService;
