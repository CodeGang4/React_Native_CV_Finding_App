const CandidateRepository = require("../../repositories/ClientRepositories/Candidate.repository");
const CandidateCache = require("../../Cache/ClientCache/Candidate.cache");
const { AppError } = require("../../utils/errorHandler");

/**
 * Service Layer - Business logic for Candidates
 * Responsibility: Orchestrate Repository + Cache, handle business rules
 */
class CandidateService {
    /**
     * Get candidate profile by user ID with caching
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async getCandidateProfile(userId) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            // Try cache first
            let profile = await CandidateCache.getProfileCache(userId);
            if (profile) {
                console.log(`✅ Profile retrieved from cache: ${userId}`);
                return profile;
            }

            console.log(`🔍 Cache miss for profile: ${userId}`);
            
            // Cache miss: Get from database
            const { data, error } = await CandidateRepository.getById(userId);
            if (error) {
                console.error("❌ Database error:", error);
                console.error(`💡 Hint: Make sure userId '${userId}' exists in candidates table with column 'user_id'`);
                throw new AppError("Failed to fetch candidate profile", 500);
            }

            if (!data) {
                console.warn(`⚠️ Candidate profile not found for userId: ${userId}`);
                console.warn(`💡 Hint: This might be a record ID instead of user_id. Check if you're using the correct ID from JWT token.`);
                throw new AppError("Candidate profile not found", 404);
            }

            // Cache the profile
            await CandidateCache.setProfileCache(userId, data);
            console.log(`✅ Profile cached successfully: ${userId}`);
            return data;
        } catch (error) {
            console.error("CandidateService.getCandidateProfile error:", error);
            throw error;
        }
    }

    /**
     * Get all candidates with caching
     * @returns {Promise<Array>}
     */
    async getAllCandidates() {
        try {
            // Try cache first
            let candidates = await CandidateCache.getAllCandidatesCache();
            if (candidates && candidates.length > 0) {
                console.log("All candidates retrieved from cache");
                return candidates;
            }

            // Cache miss: Get from database
            const { data, error } = await CandidateRepository.getAllCandidates();
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch candidates", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache all candidates
            await CandidateCache.setAllCandidatesCache(data);
            console.log(`Cached ${data.length} candidates`);

            return data;
        } catch (error) {
            console.error("CandidateService.getAllCandidates error:", error);
            throw error;
        }
    }

    /**
     * Update candidate profile
     * @param {string} userId
     * @param {Object} updateData
     * @returns {Promise<Object>}
     */
    async updateCandidateProfile(userId, updateData) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            // Validate gender if provided
            const validGenders = ['male', 'female', 'other'];
            if (updateData.gender && !validGenders.includes(updateData.gender)) {
                throw new AppError("Invalid gender value", 400);
            }

            // Update in database
            const { data, error } = await CandidateRepository.updateCandidate(userId, updateData);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to update candidate profile", 500);
            }

            if (!data) {
                throw new AppError("Candidate not found or not updated", 404);
            }

            // Update cache
            await CandidateCache.updateCandidateCache(userId, data);
            
            // Invalidate all candidates cache as list changed
            await CandidateCache.invalidateAllCandidatesCache();
            
            console.log(`Profile updated successfully: ${userId}`);

            return data;
        } catch (error) {
            console.error("CandidateService.updateCandidateProfile error:", error);
            throw error;
        }
    }

    /**
     * Upload CV file and update candidate profile
     * @param {string} userId
     * @param {Object} file - File object from multer { buffer, originalname, mimetype }
     * @returns {Promise<string>} Public URL of uploaded CV
     */
    async uploadCV(userId, file) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            if (!file || !file.buffer) {
                throw new AppError("No file uploaded", 400);
            }

            // Validate file type (optional)
            const allowedMimeTypes = ['application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new AppError("Invalid file type. Only PDF and DOC files are allowed", 400);
            }

            // Validate file size (e.g., max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.buffer.length > maxSize) {
                throw new AppError("File size exceeds 5MB limit", 400);
            }

            console.log(`Starting CV upload for user: ${userId}`);

            // 1. Upload file to storage
            const { data: uploadData, error: uploadError } = await CandidateRepository.uploadCVFile(
                userId,
                file.buffer,
                file.originalname,
                file.mimetype
            );

            if (uploadError || !uploadData) {
                console.error("File upload error:", uploadError);
                throw new AppError("Failed to upload CV file", 500);
            }

            console.log(`CV file uploaded successfully: ${uploadData.path}`);

            // 2. Get public URL
            const publicURL = CandidateRepository.getPublicCVUrl(uploadData.path);
            console.log(`Public URL generated: ${publicURL}`);

            // 3. Update database with CV URL
            const { data: updateData, error: updateError } = await CandidateRepository.updateCVUrl(
                userId,
                publicURL
            );

            if (updateError || !updateData) {
                console.error("Database update error:", updateError);
                throw new AppError("Failed to update CV URL in database", 500);
            }

            console.log(`Database updated with CV URL`);

            // 4. Update cache with new CV URL
            await CandidateCache.updateCandidateCache(userId, updateData);
            await CandidateCache.invalidateAllCandidatesCache();

            console.log(`Cache updated successfully`);

            return publicURL;
        } catch (error) {
            console.error("CandidateService.uploadCV error:", error);
            throw error;
        }
    }

    /**
     * Upload portfolio file and update candidate profile + user avatar
     * @param {string} userId
     * @param {Object} file - File object from multer { buffer, originalname, mimetype }
     * @returns {Promise<Object>} { portfolio_url, message }
     */
    async uploadPortfolio(userId, file) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            if (!file || !file.buffer) {
                throw new AppError("No file uploaded", 400);
            }

            // Validate image file type
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new AppError("Invalid file type. Only image files are allowed", 400);
            }

            // Validate file size (e.g., max 10MB for images)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.buffer.length > maxSize) {
                throw new AppError("File size exceeds 10MB limit", 400);
            }

            console.log(`Starting Portfolio upload for user: ${userId}`);

            // 1. Upload portfolio file to storage
            const { data: uploadData, error: uploadError } = await CandidateRepository.uploadPortfolioFile(
                userId,
                file.buffer,
                file.originalname,
                file.mimetype
            );

            if (uploadError || !uploadData) {
                console.error("Portfolio upload error:", uploadError);
                throw new AppError("Failed to upload portfolio file", 500);
            }

            console.log(`Portfolio file uploaded successfully: ${uploadData.path}`);

            // 2. Get public URL
            const publicURL = CandidateRepository.getPublicPortfolioUrl(uploadData.path);
            console.log(`Portfolio URL generated: ${publicURL}`);

            // 3. Update candidate's portfolio URL
            const { error: candidateError } = await CandidateRepository.updatePortfolioUrl(
                userId,
                publicURL
            );

            if (candidateError) {
                console.error("Candidate portfolio update error:", candidateError);
                throw new AppError("Failed to update portfolio URL in candidates table", 500);
            }

            // 4. Update user's avatar URL
            const { error: avatarError } = await CandidateRepository.updateUserAvatar(
                userId,
                publicURL
            );

            if (avatarError) {
                console.error("User avatar update error:", avatarError);
                throw new AppError("Failed to update avatar URL in users table", 500);
            }

            console.log(`Portfolio and avatar URLs updated successfully`);

            // 5. Invalidate caches
            await CandidateCache.invalidateCandidateCache(userId);
            await CandidateCache.invalidateAllCandidatesCache();

            console.log(`Caches invalidated successfully`);

            return {
                portfolio_url: publicURL
            };
        } catch (error) {
            console.error("CandidateService.uploadPortfolio error:", error);
            throw error;
        }
    }
}

module.exports = new CandidateService();
