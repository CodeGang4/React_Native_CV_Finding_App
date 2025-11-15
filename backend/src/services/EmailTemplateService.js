const EmailTemplateRepository = require('../repositories/EmployerRepositories/EmailTemplate.repository');
const EmailTemplateCache = require('../cache/EmployerCache/EmailTemplate.cache');
const AppError = require('../utils/appError');

class EmailTemplateService {
    /**
     * Get all templates for employer (both employer-specific and default)
     */
    async getTemplates(employerId) {
        if (!employerId) {
            throw new AppError('Employer ID is required', 400);
        }

        const employerTemplates = await this.getEmployerTemplates(employerId);
        const defaultTemplates = await this.getDefaultTemplates();

        return {
            employerTemplates,
            defaultTemplates: defaultTemplates || [],
            availableVariables: this.getAvailableVariables()
        };
    }

    /**
     * Get specific template by ID
     */
    async getTemplate(templateId) {
        const cached = await EmailTemplateCache.getCachedTemplate(templateId);
        if (cached) {
            return {
                template: cached,
                availableVariables: this.getAvailableVariables()
            };
        }

        const template = await EmailTemplateRepository.getTemplateById(templateId);
        if (!template) {
            throw new AppError('Template not found', 404);
        }

        await EmailTemplateCache.cacheTemplate(templateId, template);

        return {
            template,
            availableVariables: this.getAvailableVariables()
        };
    }

    /**
     * Create new template
     */
    async createTemplate(employerId, templateData) {
        const { name, type, subject, template } = templateData;

        if (!name || !subject || !template) {
            throw new AppError('Name, subject, and template are required', 400);
        }

        const newTemplate = await EmailTemplateRepository.createTemplate({
            name: name.toLowerCase().trim(),
            type: type || 'interview_invitation',
            subject,
            template,
            employer_id: employerId,
            candidate_id: null
        });

        await EmailTemplateCache.invalidateTemplateCache(employerId);

        return {
            message: 'Template created successfully',
            template: newTemplate
        };
    }

    /**
     * Update template
     */
    async updateTemplate(templateId, templateData) {
        const { name, type, subject, template } = templateData;

        const updateData = {};
        if (name) updateData.name = name.toLowerCase().trim();
        if (type) updateData.type = type;
        if (subject) updateData.subject = subject;
        if (template) updateData.template = template;

        const updated = await EmailTemplateRepository.updateTemplate(templateId, updateData);

        // Get employer_id to invalidate cache
        const templateInfo = await EmailTemplateRepository.getTemplateById(templateId);
        if (templateInfo?.employer_id) {
            await EmailTemplateCache.invalidateTemplateCache(templateInfo.employer_id, templateId);
        }

        return {
            message: 'Template updated successfully',
            template: updated
        };
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        const templateInfo = await EmailTemplateRepository.getTemplateById(templateId);
        
        await EmailTemplateRepository.deleteTemplate(templateId);

        if (templateInfo?.employer_id) {
            await EmailTemplateCache.invalidateTemplateCache(templateInfo.employer_id, templateId);
        }

        return true;
    }

    /**
     * Preview template with sample data
     */
    async previewTemplate(templateId, sampleData = {}) {
        const templateData = await EmailTemplateRepository.getTemplateById(templateId);

        if (!templateData) {
            throw new AppError('Template not found', 404);
        }

        const defaultSampleData = {
            toEmail: 'candidate@example.com',
            companyName: 'TCC & Partners',
            emailDateTime: '15/10/2024 - 14:00',
            emailLocation: 'Tầng 10, Tòa nhà ABC',
            emailDuration: '60 phút',
            candidateName: 'Nguyễn Văn A',
            jobTitle: 'Senior Developer'
        };

        const variables = { ...defaultSampleData, ...sampleData };

        const processedSubject = this.processTemplate(templateData.subject, variables);
        const processedTemplate = this.processTemplate(templateData.template, variables);

        return {
            preview: {
                subject: processedSubject,
                htmlContent: processedTemplate,
                variables
            }
        };
    }

    /**
     * Get template by name and employer (used by sendEmailService)
     */
    async getTemplate(templateName, employerId = null) {
        try {
            console.log(`Fetching template: ${templateName} for employer: ${employerId || 'default'}`);

            let templateData = null;

            if (employerId) {
                templateData = await EmailTemplateRepository.getTemplateByName(templateName, employerId);
                if (templateData) {
                    console.log('Found employer-specific template');
                }
            }

            if (!templateData) {
                const defaultTemplates = await this.getDefaultTemplates();
                templateData = defaultTemplates.find(t => t.name === templateName);
                if (templateData) {
                    console.log('Found default template');
                }
            }

            return templateData;
        } catch (error) {
            console.error('Error in getTemplate:', error);
            return null;
        }
    }

    /**
     * Process template with variables
     */
    processTemplate(template, variables) {
        if (!template) return '';

        let processedTemplate = template;

        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            processedTemplate = processedTemplate.replace(regex, variables[key] || '');
        });

        return processedTemplate;
    }

    /**
     * Get employer templates
     */
    async getEmployerTemplates(employerId) {
        const cached = await EmailTemplateCache.getCachedEmployerTemplates(employerId);
        if (cached) {
            return cached;
        }

        const templates = await EmailTemplateRepository.getEmployerTemplates(employerId);
        await EmailTemplateCache.cacheEmployerTemplates(employerId, templates);

        return templates;
    }

    /**
     * Get default templates
     */
    async getDefaultTemplates() {
        const cached = await EmailTemplateCache.getCachedDefaultTemplates();
        if (cached) {
            return cached;
        }

        const templates = await EmailTemplateRepository.getDefaultTemplates();
        await EmailTemplateCache.cacheDefaultTemplates(templates);

        return templates;
    }

    /**
     * Get template by ID
     */
    async getTemplateById(templateId) {
        return await EmailTemplateRepository.getTemplateById(templateId);
    }

    /**
     * Get available variables
     */
    getAvailableVariables() {
        return [
            { name: 'toEmail', description: 'Email người nhận' },
            { name: 'companyName', description: 'Tên công ty' },
            { name: 'emailDateTime', description: 'Thời gian phỏng vấn' },
            { name: 'emailLocation', description: 'Địa điểm phỏng vấn' },
            { name: 'emailDuration', description: 'Thời lượng phỏng vấn' },
            { name: 'candidateName', description: 'Tên ứng viên' },
            { name: 'jobTitle', description: 'Vị trí tuyển dụng' },
            { name: 'hrContact', description: 'Liên hệ HR' }
        ];
    }
}

module.exports = new EmailTemplateService();
