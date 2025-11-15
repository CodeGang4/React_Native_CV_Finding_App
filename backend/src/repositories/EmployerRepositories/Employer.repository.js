const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

class EmployerRepository {
    /**
     * Get company info by user ID
     */
    async getCompanyInfo(companyId) {
        const { data, error } = await supabase
            .from('employers')
            .select('*')
            .eq('user_id', companyId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get all companies
     */
    async getAllCompanies() {
        const { data, error } = await supabase
            .from('employers')
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get verified companies
     */
    async getVerifiedCompanies() {
        const { data, error } = await supabase
            .from('employers')
            .select('*')
            .eq('isverified', true);

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Verify company
     */
    async verifyCompany(companyId) {
        const { data, error } = await supabase
            .from('employers')
            .update({
                isverified: true,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', companyId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Update company status
     */
    async updateCompanyStatus(companyId, status) {
        const { data, error } = await supabase
            .from('employers')
            .update({
                status: status,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', companyId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Get companies by status
     */
    async getCompaniesByStatus(status) {
        const { data, error } = await supabase
            .from('employers')
            .select('*')
            .eq('status', status);

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Update company info
     */
    async updateCompanyInfo(companyId, updateData) {
        const { data, error } = await supabase
            .from('employers')
            .update(updateData)
            .eq('user_id', companyId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Upload company logo
     */
    async uploadCompanyLogo(companyId, filePath, fileBuffer, mimetype) {
        const { data, error } = await supabaseStorage.storage
            .from('Company_Logo_Buckets')
            .upload(filePath, fileBuffer, {
                contentType: mimetype,
                upsert: true,
            });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get public URL for company logo
     */
    getPublicUrl(filePath) {
        const { data } = supabase.storage
            .from('Company_Logo_Buckets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * Update company logo URL
     */
    async updateCompanyLogoUrl(companyId, logoUrl) {
        const { data, error } = await supabase
            .from('employers')
            .update({ company_logo: logoUrl })
            .eq('user_id', companyId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Update user avatar
     */
    async updateUserAvatar(userId, avatarUrl) {
        const { data, error } = await supabase
            .from('users')
            .update({ avatar: avatarUrl })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Update company name
     */
    async updateCompanyName(companyId, companyName) {
        const { data, error } = await supabase
            .from('employers')
            .update({ company_name: companyName })
            .eq('user_id', companyId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Update username
     */
    async updateUsername(userId, username) {
        const { data, error } = await supabase
            .from('users')
            .update({ username })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get top companies with analytics
     */
    async getTopCompaniesWithStats() {
        const { data, error } = await supabase
            .from('employers')
            .select(`
                user_id,
                company_name,
                company_logo,
                industry,
                jobs!jobs_employer_id_fkey (
                    id,
                    applications!applications_job_id_fkey (
                        candidate_id
                    )
                )
            `);

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get company analytics
     */
    async getCompanyAnalytics(companyId) {
        const { data, error } = await supabase
            .from('employers')
            .select(`
                *,
                jobs!jobs_employer_id_fkey (
                    id,
                    title,
                    created_at,
                    applications!applications_job_id_fkey (
                        id,
                        candidate_id,
                        status,
                        applied_at,
                        candidates!applications_candidate_id_fkey (
                            full_name,
                            phone,
                            education
                        )
                    )
                )
            `)
            .eq('user_id', companyId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new EmployerRepository();
