const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');

// Create storage client with service key for admin operations
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
);

/**
 * Repository Layer - Database operations for Candidates
 * Responsibility: Data access and persistence
 */
class CandidateRepository {

    /**
     * Get candidate by user ID
     * @param {string} candidateId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async getById(candidateId) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('user_id', candidateId)
                .single();
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.getById error:', error);
            return { data: null, error };
        }
    }

    /**
     * Get all candidates
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async getAllCandidates() {
        try {
            const { data, error } = await supabase
                .from("candidates")
                .select("*")
                .order('created_at', { ascending: false });
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.getAllCandidates error:', error);
            return { data: null, error };
        }
    }

    /**
     * Update candidate profile
     * @param {string} candidateId
     * @param {Object} updateData
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updateCandidate(candidateId, updateData) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .update(updateData)
                .eq('user_id', candidateId)
                .select()
                .single();
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.updateCandidate error:', error);
            return { data: null, error };
        }
    }

    /**
     * Upload CV file to Supabase Storage
     * @param {string} userId - User ID
     * @param {Buffer} fileBuffer - File buffer from multer
     * @param {string} originalName - Original file name
     * @param {string} mimeType - File MIME type
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async uploadCVFile(userId, fileBuffer, originalName, mimeType) {
        try {
            const filePath = `${userId}/${Date.now()}_${originalName}`;
            const { data, error } = await supabaseStorage.storage
                .from('CV_buckets')
                .upload(filePath, fileBuffer, {
                    contentType: mimeType,
                    upsert: true,
                });

            if (error) {
                return { data: null, error };
            }

            return { data: { path: filePath }, error: null };
        } catch (error) {
            console.error('CandidateRepository.uploadCVFile error:', error);
            return { data: null, error };
        }
    }

    /**
     * Get public URL for uploaded CV
     * @param {string} filePath - File path in storage
     * @returns {string} Public URL
     */
    getPublicCVUrl(filePath) {
        const { data } = supabase.storage
            .from('CV_buckets')
            .getPublicUrl(filePath);
        return data.publicUrl;
    }

    /**
     * Update candidate's CV URL in database
     * @param {string} userId
     * @param {string} cvUrl
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updateCVUrl(userId, cvUrl) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .update({ cv_url: cvUrl })
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.updateCVUrl error:', error);
            return { data: null, error };
        }
    }

    /**
     * Upload portfolio file to Supabase Storage
     * @param {string} userId - User ID
     * @param {Buffer} fileBuffer - File buffer from multer
     * @param {string} originalName - Original file name
     * @param {string} mimeType - File MIME type
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async uploadPortfolioFile(userId, fileBuffer, originalName, mimeType) {
        try {
            const filePath = `${userId}/${Date.now()}_${originalName}`;
            const { data, error } = await supabaseStorage.storage
                .from('Portfolio_Buckets')
                .upload(filePath, fileBuffer, {
                    contentType: mimeType,
                    upsert: true,
                });

            if (error) {
                return { data: null, error };
            }

            return { data: { path: filePath }, error: null };
        } catch (error) {
            console.error('CandidateRepository.uploadPortfolioFile error:', error);
            return { data: null, error };
        }
    }

    /**
     * Get public URL for uploaded portfolio
     * @param {string} filePath - File path in storage
     * @returns {string} Public URL
     */
    getPublicPortfolioUrl(filePath) {
        const { data } = supabase.storage
            .from('Portfolio_Buckets')
            .getPublicUrl(filePath);
        return data.publicUrl;
    }

    /**
     * Update candidate's portfolio URL
     * @param {string} userId
     * @param {string} portfolioUrl
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updatePortfolioUrl(userId, portfolioUrl) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .update({ portfolio: portfolioUrl })
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.updatePortfolioUrl error:', error);
            return { data: null, error };
        }
    }

    /**
     * Update user's avatar URL
     * @param {string} userId
     * @param {string} avatarUrl
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updateUserAvatar(userId, avatarUrl) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ avatar: avatarUrl })
                .eq('id', userId)
                .select()
                .single();
            return { data, error };
        } catch (error) {
            console.error('CandidateRepository.updateUserAvatar error:', error);
            return { data: null, error };
        }
    }
}

module.exports = new CandidateRepository();

module.exports = new CandidateRepository();