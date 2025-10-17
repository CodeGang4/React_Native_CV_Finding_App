// const nodemailer = require('nodemailer');
// const sendEmailService = require('../../services/sendEmailService');
const supabase = require('../../supabase/config');
class EmailTemplateController {
    async addTemplates(req, res) {
        const { candidate_id, template, employerId, type, name, subject } =
            req.body;
        if (
            !candidate_id ||
            !template ||
            !employerId ||
            !type ||
            !name ||
            !subject
        ) {
            return res
                .status(400)
                .json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Lưu thông tin template vào cơ sở dữ liệu
        const { data, error } = await supabase
            .from('email_templates')
            .insert([
                {
                    candidate_id: candidate_id,
                    template,
                    employer_id: employerId,
                    type,
                    name,
                    subject,
                },
            ])
            .select();

        if (error) {
            return res
                .status(500)
                .json({ message: 'Lỗi khi thêm template', error });
        }

        return res.status(201).json(data[0]);
    }

    // Get templates by employer ID
    async getTemplatesByEmployer(req, res) {
        const employerId = req.params.employerId;
        if (!employerId) {
            return res
                .status(400)
                .json({ message: 'Employer ID is required in URL params' });
        }
        
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('employer_id', employerId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching templates by employer:', error);
            return res
                .status(500)
                .json({
                    message: 'Lỗi khi lấy danh sách template',
                    error: error.message,
                });
        }
        
        return res.status(200).json(data || []);
    }

    // Get single template by ID
    async getTemplates(req, res) {
        const templateId = req.params.templateId;
        if (!templateId) {
            return res
                .status(400)
                .json({ message: 'Template ID is required in URL params' });
        }
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', templateId)
            .single();
        if (error) {
            console.error('Error fetching template data:', error);
            return res
                .status(500)
                .json({
                    message: 'Lỗi khi lấy thông tin template',
                    error: error.message,
                });
        }
        if (!data) {
            return res.status(404).json({ message: 'Template không tồn tại' });
        }
        return res.status(200).json(data);
    }

    async deleteTemplate(req, res) {
        const templateId = req.params.templateId;
        if (!templateId) {
            return res
                .status(400)
                .json({ message: 'Template ID is required in URL params' });
        }
        const { data, error } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', templateId)
            .select();
        if (error) {
            console.error('Error deleting template:', error);
            return res
                .status(500)
                .json({
                    message: 'Lỗi khi xóa template',
                    error: error.message,
                });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ message: 'Template không tồn tại hoặc không thể xóa' });
        }
        return res.status(200).json(data);
    }
}

module.exports = new EmailTemplateController();
