const EmailTemplateService = require('../../services/EmailTemplateService');
const supabase = require('../../supabase/config');

class EmailTemplateController {
    // Lấy tất cả templates của employer
    async getTemplates(req, res) {
        const employerId = req.params.employerId;

        if (!employerId) {
            return res.status(400).json({ message: 'Employer ID is required' });
        }

        try {
            const templates =
                await EmailTemplateService.getEmployerTemplates(employerId);

            // Lấy thêm default templates
            const defaultTemplates =
                await EmailTemplateService.getDefaultTemplates();

            return res.status(200).json({
                success: true,
                employerTemplates: templates,
                defaultTemplates: defaultTemplates || [],
                availableVariables:
                    EmailTemplateService.getAvailableVariables(),
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch templates',
                error: error.message,
            });
        }
    }

    // Lấy template cụ thể
    async getTemplate(req, res) {
        const { employerId, templateId } = req.params;

        try {
            const templateData =
                await EmailTemplateService.getTemplateById(templateId);

            if (!templateData) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found',
                });
            }

            return res.status(200).json({
                success: true,
                template: templateData,
                availableVariables:
                    EmailTemplateService.getAvailableVariables(),
            });
        } catch (error) {
            console.error('Error fetching template:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch template',
                error: error.message,
            });
        }
    }

    // Tạo template mới
    async createTemplate(req, res) {
        const employerId = req.params.employerId;
        const { name, type, subject, template } = req.body;

        if (!name || !subject || !template) {
            return res.status(400).json({
                message: 'Name, subject, and template are required',
            });
        }

        try {
            const templateData = {
                name: name.toLowerCase().trim(),
                type: type || 'interview_invitation',
                subject,
                template,
                employer_id: employerId,
                candidate_id: null,
            };

            const newTemplate =
                await EmailTemplateService.createTemplate(templateData);

            return res.status(201).json({
                success: true,
                message: 'Template created successfully',
                template: newTemplate,
            });
        } catch (error) {
            console.error('Error creating template:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create template',
                error: error.message,
            });
        }
    }

    // Cập nhật template
    async updateTemplate(req, res) {
        const { templateId } = req.params;
        const { name, type, subject, template } = req.body;

        try {
            const updateData = {};

            if (name) updateData.name = name.toLowerCase().trim();
            if (type) updateData.type = type;
            if (subject) updateData.subject = subject;
            if (template) updateData.template = template;

            const updatedTemplate = await EmailTemplateService.updateTemplate(
                templateId,
                updateData,
            );

            return res.status(200).json({
                success: true,
                message: 'Template updated successfully',
                template: updatedTemplate,
            });
        } catch (error) {
            console.error('Error updating template:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update template',
                error: error.message,
            });
        }
    }

    // Xóa template
    async deleteTemplate(req, res) {
        const { templateId } = req.params;

        try {
            await EmailTemplateService.deleteTemplate(templateId);

            return res.status(200).json({
                success: true,
                message: 'Template deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting template:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete template',
                error: error.message,
            });
        }
    }

    // Preview template với sample data
    async previewTemplate(req, res) {
        const { employerId, templateId } = req.params;
        const { sampleData } = req.body;

        try {
            const templateData =
                await EmailTemplateService.getTemplateById(templateId);

            if (!templateData) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found',
                });
            }

            // Sample data mặc định
            const defaultSampleData = {
                toEmail: 'candidate@example.com',
                companyName: 'TCC & Partners',
                emailDateTime: '15/10/2024 - 14:00',
                emailLocation: 'Tầng 10, Tòa nhà ABC',
                emailDuration: '60 phút',
                candidateName: 'Nguyễn Văn A',
                jobTitle: 'Senior Developer',
            };

            const variables = { ...defaultSampleData, ...sampleData };

            const processedSubject = EmailTemplateService.processTemplate(
                templateData.subject,
                variables,
            );
            const processedTemplate = EmailTemplateService.processTemplate(
                templateData.template,
                variables,
            );

            return res.status(200).json({
                success: true,
                preview: {
                    subject: processedSubject,
                    htmlContent: processedTemplate,
                    variables: variables,
                },
            });
        } catch (error) {
            console.error('Error previewing template:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to preview template',
                error: error.message,
            });
        }
    }
}

module.exports = new EmailTemplateController();
