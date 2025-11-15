const AuthRepository = require('../../repositories/ClientRepositories/Auth.repository');
const AuthCache = require('../../Cache/ClientCache/Auth.cache');
const redis = require('../../redis/config');
const { AppError } = require('../../utils/errorHandler');

class AuthService {
    /**
     * Register new user
     */
    async register(email, password, recheckPassword, username, role = 'candidate') {
        // Validate passwords match
        if (password !== recheckPassword) {
            throw new AppError('Passwords do not match', 400);
        }

        // Create user in Supabase Auth
        const user = await AuthRepository.createUser(email, password, username, role);

        if (!user) {
            throw new AppError('Failed to create user', 400);
        }

        // Upsert user data
        const userData = await AuthRepository.upsertUserData(user.id, user.email, username, role);

        // Create role-specific record
        if (role === 'candidate') {
            const existingCandidate = await AuthRepository.checkCandidateExists(user.id);
            if (!existingCandidate) {
                await AuthRepository.createCandidate(user.id, username);
            }
        } else if (role === 'employer') {
            const existingEmployer = await AuthRepository.checkEmployerExists(user.id);
            if (!existingEmployer) {
                await AuthRepository.createEmployer(user.id, `${username} Company`, username);
            }
        }

        // Cache user data
        try {
            await redis.set(`user:${user.id}`, JSON.stringify(userData));
        } catch (error) {
            console.error('Redis cache error (non-critical):', error);
        }

        const needsEmailConfirmation = !user.email_confirmed_at;
        
        return {
            user: {
                ...user,
                role: userData.role,
                username: userData.username
            },
            needs_email_confirmation: needsEmailConfirmation,
            message: needsEmailConfirmation 
                ? 'Registration successful! Please check your email to confirm your account.' 
                : 'Registration successful!'
        };
    }

    /**
     * Login user
     */
    async login(email, password, role = 'candidate') {
        // Authenticate with Supabase
        const authData = await AuthRepository.loginUser(email, password);

        if (!authData || !authData.user) {
            throw new AppError('Invalid email or password', 401);
        }

        const user = authData.user;

        if (!user.confirmed_at) {
            throw new AppError('Please confirm your email before logging in.', 403);
        }

        // Get user data from database
        const userData = await AuthRepository.getUserById(user.id);

        if (!userData) {
            throw new AppError('Account not found. Please register first.', 401);
        }

        // Validate role
        if (userData.role !== role) {
            throw new AppError(
                `Invalid role. This account is registered as ${userData.role}. Please login with the correct role.`, 
                403
            );
        }

        // Ensure role record exists (fallback)
        if (role === 'candidate') {
            const existingCandidate = await AuthRepository.checkCandidateExists(user.id);
            if (!existingCandidate) {
                await AuthRepository.createCandidate(user.id, userData.username || user.email.split('@')[0]);
            }
        } else if (role === 'employer') {
            const existingEmployer = await AuthRepository.checkEmployerExists(user.id);
            if (!existingEmployer) {
                await AuthRepository.createEmployer(user.id, `${userData.username} Company`, userData.username);
            }
        }

        // Cache access token
        const accessToken = authData.session.access_token;
        const tokenTTL = 3600 * 24; // 24 hours

        try {
            await AuthCache.setAccessToken(user.id, accessToken, tokenTTL);
            console.log(`Cached access token for user: ${user.id}`);
        } catch (cacheError) {
            console.log('Token cache failed (non-critical):', cacheError.message);
        }

        // Cache user data
        try {
            await redis.setEx(`user:${user.id}`, 3600, JSON.stringify(userData));
            console.log(`Cached user data: user:${user.id}`);
        } catch (cacheError) {
            console.log('User cache failed (non-critical):', cacheError.message);
        }

        return {
            user: {
                ...user,
                role: userData.role,
                username: userData.username,
            },
            access_token: accessToken,
            token: accessToken,
            isFirstLogin: false,
        };
    }

    /**
     * Logout user
     */
    async logout(token) {
        if (!token) {
            throw new AppError('Missing token', 401);
        }

        // Get user from token
        let user = null;
        try {
            user = await AuthRepository.getUserFromToken(token);
        } catch (error) {
            console.log('Could not get user from token:', error.message);
        }

        // Logout from Supabase
        await AuthRepository.logoutUser();

        // Clear cache
        if (user) {
            try {
                await AuthCache.deleteAccessToken(user.id);
                await redis.del(`user:${user.id}`);
                console.log(`Cleared cache for user: ${user.id}`);
            } catch (cacheError) {
                console.log('Cache clear failed (non-critical):', cacheError.message);
            }
        }

        return { message: 'Logged out successfully' };
    }

    /**
     * Get all candidates (debug)
     */
    async getAllCandidates() {
        const candidates = await AuthRepository.getAllCandidates();
        return { candidates, count: candidates.length };
    }

    /**
     * Get all users (debug)
     */
    async getAllUsers() {
        const users = await AuthRepository.getAllUsers();
        return { users, count: users.length };
    }
}

module.exports = new AuthService();
