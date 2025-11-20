const supabase = require('../../supabase/config');

class EmailTemplateRepository {
    /**
     * Get all templates for an employer
     */
    static async getEmployerTemplates(employerId) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('employer_id', employerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getEmployerTemplates:', error);
            throw error;
        }
    }

    /**
     * Get default templates (system templates)
     */
    static async getDefaultTemplates() {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .is('employer_id', null)
                .eq('is_default', true)
                .order('type');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getDefaultTemplates:', error);
            throw error;
        }
    }

    /**
     * Get template by ID
     */
    static async getTemplateById(templateId) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getTemplateById:', error);
            throw error;
        }
    }

    /**
     * Create new template
     */
    static async createTemplate(templateData) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .insert(templateData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in createTemplate:', error);
            throw error;
        }
    }

    /**
     * Update template
     */
    static async updateTemplate(templateId, updateData) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', templateId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in updateTemplate:', error);
            throw error;
        }
    }

    /**
     * Delete template
     */
    static async deleteTemplate(templateId) {
        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error in deleteTemplate:', error);
            throw error;
        }
    }

    /**
     * Get template by name and employer
     */
    static async getTemplateByName(templateName, employerId) {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('name', templateName.toLowerCase().trim())
                .eq('employer_id', employerId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error in getTemplateByName:', error);
                return null; // Return null instead of throwing
            }
            return data;
        } catch (error) {
            console.error('Error in getTemplateByName:', error);
            return null; // Return null to allow fallback
        }
    }
}

module.exports = EmailTemplateRepository;
