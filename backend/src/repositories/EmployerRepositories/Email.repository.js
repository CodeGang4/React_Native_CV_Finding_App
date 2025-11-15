const supabase = require('../../supabase/config');

class EmailRepository {
    /**
     * Get company information
     */
    static async getCompanyInfo(companyId) {
        try {
            const { data, error } = await supabase
                .from('employers')
                .select('company_name, company_logo, industry, contact_person')
                .eq('user_id', companyId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getCompanyInfo:', error);
            throw error;
        }
    }

    /**
     * Get candidate email by candidate ID
     */
    static async getCandidateEmail(candidateId) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .select(`
                    user_id,
                    full_name,
                    users!inner(email)
                `)
                .eq('user_id', candidateId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getCandidateEmail:', error);
            throw error;
        }
    }

    /**
     * Get multiple candidates' emails
     */
    static async getCandidatesEmails(candidateIds) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .select(`
                    user_id,
                    full_name,
                    users!inner(email)
                `)
                .in('user_id', candidateIds);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getCandidatesEmails:', error);
            throw error;
        }
    }

    /**
     * Log email sent record
     */
    static async logEmailSent(emailData) {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .insert({
                    employer_id: emailData.employer_id,
                    recipient_email: emailData.recipient_email,
                    recipient_name: emailData.recipient_name,
                    email_type: emailData.email_type,
                    subject: emailData.subject,
                    message_id: emailData.message_id,
                    status: emailData.status || 'sent',
                    sent_at: new Date().toISOString(),
                    metadata: emailData.metadata || {}
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in logEmailSent:', error);
            // Don't throw - logging failure shouldn't break email sending
            return null;
        }
    }

    /**
     * Get email sending history for a company
     */
    static async getEmailHistory(employerId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .eq('employer_id', employerId)
                .order('sent_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getEmailHistory:', error);
            throw error;
        }
    }

    /**
     * Get email statistics for a company
     */
    static async getEmailStats(employerId) {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('status, email_type')
                .eq('employer_id', employerId);

            if (error) throw error;

            const stats = {
                total: data.length,
                sent: data.filter(e => e.status === 'sent').length,
                failed: data.filter(e => e.status === 'failed').length,
                by_type: {
                    formal: data.filter(e => e.email_type === 'formal').length,
                    friendly: data.filter(e => e.email_type === 'friendly').length,
                    online: data.filter(e => e.email_type === 'online').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Error in getEmailStats:', error);
            throw error;
        }
    }
}

module.exports = EmailRepository;
