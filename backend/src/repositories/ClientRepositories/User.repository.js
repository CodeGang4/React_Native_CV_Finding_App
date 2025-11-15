const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

class UserRepository {
    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Update user role
     */
    async updateUserRole(userId, role) {
        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Update candidate profile
     */
    async updateCandidateProfile(userId, profileData) {
        const { data, error } = await supabase
            .from('candidates')
            .update(profileData)
            .eq('user_id', userId)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }

    /**
     * Upsert candidate
     */
    async upsertCandidate(userId, fullName) {
        const { data, error } = await supabase
            .from('candidates')
            .upsert({
                user_id: userId,
                full_name: fullName,
            })
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Upsert employer
     */
    async upsertEmployer(userId, companyName) {
        const { data, error } = await supabase
            .from('employers')
            .upsert({
                user_id: userId,
                company_name: companyName,
            })
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Upload file to storage
     */
    async uploadFileToStorage(bucketName, filePath, fileBuffer, mimetype) {
        const { data, error } = await supabaseStorage.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
                contentType: mimetype,
                upsert: true
            });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get public URL from storage
     */
    getPublicUrl(bucketName, filePath) {
        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * Update candidate CV URL
     */
    async updateCandidateCV(userId, cvUrl) {
        const { error } = await supabase
            .from('candidates')
            .update({ cv_url: cvUrl })
            .eq('user_id', userId);

        if (error) {
            throw error;
        }
    }

    /**
     * Update candidate portfolio
     */
    async updateCandidatePortfolio(userId, portfolioUrl) {
        const { error } = await supabase
            .from('candidates')
            .update({ portfolio: portfolioUrl })
            .eq('user_id', userId);

        if (error) {
            throw error;
        }
    }
}

module.exports = new UserRepository();
