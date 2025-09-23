const supabase = require('../supabase/config');

class EmailTemplateService {
    // Lấy template theo type và employer
    async getTemplate(templateName, employerId = null) {
        try {
            console.log(
                `Fetching template: ${templateName} for employer: ${employerId || 'default'}`,
            );

            let templateData = null;

            // Nếu có employerId, ưu tiên template của employer đó
            if (employerId) {
                const { data: employerTemplate, error: employerError } =
                    await supabase
                        .from('email_templates')
                        .select('*')
                        .eq('name', templateName)
                        .eq('employer_id', employerId)
                        .single();

                if (!employerError && employerTemplate) {
                    templateData = employerTemplate;
                    console.log('Found employer-specific template');
                }
            }

            // Nếu không có employer template, lấy template mặc định
            if (!templateData) {
                const { data: defaultTemplate, error: defaultError } =
                    await supabase
                        .from('email_templates')
                        .select('*')
                        .eq('name', templateName)
                        .is('employer_id', null) // template mặc định
                        .is('candidate_id', null) // template mặc định
                        .single();

                if (defaultError) {
                    console.error(
                        'Error fetching default template:',
                        defaultError,
                    );
                    return null;
                }

                templateData = defaultTemplate;
                console.log('Found default template');
            }

            return templateData;
        } catch (error) {
            console.error('Error in getTemplate:', error);
            return null;
        }
    }

    // Xử lý template với biến thế
    processTemplate(template, variables) {
        if (!template) return '';

        let processedTemplate = template;

        // Thay thế tất cả các biến ${varName}
        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            processedTemplate = processedTemplate.replace(
                regex,
                variables[key] || '',
            );
        });

        return processedTemplate;
    }

    // Lấy tất cả templates của một employer
    async getEmployerTemplates(employerId) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('employer_id', employerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching employer templates:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getEmployerTemplates:', error);
            return [];
        }
    }

    // Lấy tất cả templates mặc định (hệ thống)
    async getDefaultTemplates() {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .is('employer_id', null)
                .is('candidate_id', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching default templates:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getDefaultTemplates:', error);
            return [];
        }
    }

    // Lấy template theo ID
    async getTemplateById(templateId) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (error) {
                console.error('Error fetching template by ID:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getTemplateById:', error);
            return null;
        }
    }

    // Tạo template mới
    async createTemplate(templateData) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .insert([templateData])
                .select()
                .single();

            if (error) {
                console.error('Error creating template:', error);
                throw new Error(`Failed to create template: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in createTemplate:', error);
            throw error;
        }
    }

    // Cập nhật template
    async updateTemplate(templateId, templateData) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .update(templateData)
                .eq('id', templateId)
                .select()
                .single();

            if (error) {
                console.error('Error updating template:', error);
                throw new Error(`Failed to update template: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in updateTemplate:', error);
            throw error;
        }
    }

    // Xóa template
    async deleteTemplate(templateId) {
        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', templateId);

            if (error) {
                console.error('Error deleting template:', error);
                throw new Error(`Failed to delete template: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error in deleteTemplate:', error);
            throw error;
        }
    }

    // Lấy danh sách các biến có sẵn
    getAvailableVariables() {
        return [
            { name: 'toEmail', description: 'Email người nhận' },
            { name: 'companyName', description: 'Tên công ty' },
            { name: 'emailDateTime', description: 'Thời gian phỏng vấn' },
            { name: 'emailLocation', description: 'Địa điểm phỏng vấn' },
            { name: 'emailDuration', description: 'Thời lượng phỏng vấn' },
            { name: 'candidateName', description: 'Tên ứng viên' },
            { name: 'jobTitle', description: 'Vị trí tuyển dụng' },
            { name: 'hrContact', description: 'Liên hệ HR' },
        ];
    }
}

module.exports = new EmailTemplateService();
