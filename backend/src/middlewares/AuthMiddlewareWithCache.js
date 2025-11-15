const AuthCache = require('../Cache/ClientCache/Auth.cache');
const supabase = require('../supabase/config');
const redis = require('../redis/config');

class AuthMiddleware {
    /**
     * Middleware để verify token từ cache hoặc Supabase
     */
    async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Missing access token' });
            }

            // 1. Thử lấy user info từ Supabase token
            const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

            if (tokenError || !user) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            // 2. Kiểm tra token có trong cache không
            try {
                const cachedToken = await AuthCache.getAccessToken(user.id);
                if (cachedToken && cachedToken === token) {
                    console.log(`✅ Token verified from cache for user: ${user.id}`);
                } else {
                    console.log(`⚠️ Token not in cache or mismatch for user: ${user.id}`);
                    // Token hợp lệ nhưng không có trong cache - có thể do cache expired
                    // Cache lại token này với TTL ngắn
                    await AuthCache.setAccessToken(user.id, token, 3600);
                }
            } catch (cacheError) {
                console.log('⚠️ Cache check failed (non-critical):', cacheError.message);
            }

            // 3. Lấy user data từ cache hoặc database
            let userData = null;
            try {
                const cachedUser = await redis.get(`user:${user.id}`);
                if (cachedUser) {
                    userData = JSON.parse(cachedUser);
                    console.log(`📦 User data from cache: ${user.id}`);
                } else {
                    console.log(`🔍 User cache miss, fetching from database: ${user.id}`);
                    const { data: dbUser, error: dbError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (!dbError && dbUser) {
                        userData = dbUser;
                        // Cache user data
                        await redis.setEx(`user:${user.id}`, 3600, JSON.stringify(userData));
                        console.log(`📦 Cached user data: ${user.id}`);
                    }
                }
            } catch (cacheError) {
                console.log('⚠️ User data cache error (non-critical):', cacheError.message);
            }

            // 4. Attach user info to request
            req.user = {
                ...user,
                role: userData?.role,
                username: userData?.username,
                userData: userData
            };

            next();

        } catch (error) {
            console.error('❌ Auth middleware error:', error);
            return res.status(500).json({ error: 'Authentication error' });
        }
    }

    /**
     * Middleware để check role
     */
    requireRole(allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRole = req.user.role || req.user.userData?.role;
            
            if (!userRole) {
                return res.status(403).json({ error: 'User role not found' });
            }

            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            
            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({ 
                    error: `Access denied. Required role(s): ${rolesArray.join(', ')}. Your role: ${userRole}` 
                });
            }

            next();
        };
    }

    /**
     * Middleware chỉ cho candidate
     */
    requireCandidate(req, res, next) {
        return this.requireRole('candidate')(req, res, next);
    }

    /**
     * Middleware chỉ cho employer
     */
    requireEmployer(req, res, next) {
        return this.requireRole('employer')(req, res, next);
    }

    /**
     * Middleware chỉ cho admin
     */
    requireAdmin(req, res, next) {
        return this.requireRole('admin')(req, res, next);
    }
}

module.exports = new AuthMiddleware();