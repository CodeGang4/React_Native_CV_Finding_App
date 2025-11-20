const UserRepository = require('../../repositories/ClientRepositories/User.repository');
const UserCache = require("../../Cache/ClientCache/User.cache");
const { AppError } = require('../../utils/errorHandler');
const redis = require('../../redis/config');

class UserService {
    /**
     * Get User Profile
     */
    static async getUserProfile(userId) {
        // Try cache first
        const cached = await UserCache.getCachedUserProfile(userId);
        if (cached) {
            console.log('User profile from cache:', userId);
            return cached;
        }

        // Get from database
        const user = await UserRepository.getUserProfile(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Cache result
        await UserCache.cacheUserProfile(userId, user);

        return user;
    }

    /**
     * Update User Role
     */
    static async updateUserRole(userId, role) {
        const validRoles = ['candidate', 'employer', 'admin'];

        if (!validRoles.includes(role)) {
            throw new AppError('Invalid role', 400);
        }

        const updatedUser = await UserRepository.updateUserRole(userId, role);

        if (!updatedUser) {
            throw new AppError('User not found', 404);
        }

        // Upsert candidate or employer record
        if (role === 'candidate') {
            await UserRepository.upsertCandidate({
                user_id: updatedUser.id,
                full_name: updatedUser.username,
            });
        } else if (role === 'employer') {
            await UserRepository.upsertEmployer({
                user_id: updatedUser.id,
                company_name: updatedUser.username,
            });
        }

        // Log to Redis
        try {
            await redis.setEx(
                `log:updateUserRole:${userId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'updateUserRole',
                    userId,
                    role,
                    time: new Date().toISOString()
                })
            );
        } catch (err) {
            console.error('Redis log error (updateUserRole):', err);
        }

        // Invalidate cache
        await UserCache.invalidateUserCache(userId);

        return updatedUser;
    }

    /**
     * Update Candidate Profile
     */
    static async updateCandidateProfile(userId, profileData) {
        const validGenders = ['male', 'female', 'other'];

        if (profileData.gender && !validGenders.includes(profileData.gender)) {
            throw new AppError('Invalid gender', 400);
        }

        const updatedProfile = await UserRepository.updateCandidateProfile(userId, profileData);

        if (!updatedProfile) {
            throw new AppError('Candidate not found', 404);
        }

        // Invalidate cache
        await UserCache.invalidateUserCache(userId);

        return updatedProfile;
    }

    /**
     * Upload CV
     */
    static async uploadCV(userId, file) {
        if (!file) {
            throw new AppError('No file provided', 400);
        }

        // Get user data
        const user = await UserRepository.getUserProfile(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Upload file to Supabase Storage
        const fileName = `${userId}_${Date.now()}_${file.originalname}`;
        const filePath = await UserRepository.uploadFileToStorage(
            'CV_buckets',
            fileName,
            file.buffer,
            file.mimetype
        );

        // Get public URL
        const publicUrl = UserRepository.getPublicUrl('CV_buckets', filePath);

        // Update candidate CV
        const updatedCandidate = await UserRepository.updateCandidateCV(userId, publicUrl);

        if (!updatedCandidate) {
            throw new AppError('Failed to update candidate CV', 500);
        }

        // Invalidate cache
        await UserCache.invalidateUserCache(userId);

        return {
            cv_url: publicUrl,
            candidate: updatedCandidate
        };
    }

    /**
     * Upload Portfolio
     */
    static async uploadPortfolio(userId, file) {
        if (!file) {
            throw new AppError('No file provided', 400);
        }

        // Get user data
        const user = await UserRepository.getUserProfile(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Upload file to Supabase Storage
        const fileName = `${userId}_${Date.now()}_${file.originalname}`;
        const filePath = await UserRepository.uploadFileToStorage(
            'Portfolio_Buckets',
            fileName,
            file.buffer,
            file.mimetype
        );

        // Get public URL
        const publicUrl = UserRepository.getPublicUrl('Portfolio_Buckets', filePath);

        // Update candidate portfolio
        const updatedCandidate = await UserRepository.updateCandidatePortfolio(userId, publicUrl);

        if (!updatedCandidate) {
            throw new AppError('Failed to update candidate portfolio', 500);
        }

        // Invalidate cache
        await UserCache.invalidateUserCache(userId);

        return {
            portfolio_url: publicUrl,
            candidate: updatedCandidate
        };
    }
}

module.exports = UserService;
