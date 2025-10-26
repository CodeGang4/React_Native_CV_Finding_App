const { createClient } = require('@supabase/supabase-js');
const supabase = require('../supabase/config');

const verifyToken = async (req, res, next) => {
    try {
        // Debug: Log ALL headers to see what's coming in
        console.log('🔍 [Auth Debug] All headers:', JSON.stringify(req.headers, null, 2));
        console.log('🔍 [Auth Debug] Authorization header:', req.headers.authorization);
        console.log('🔍 [Auth Debug] Request URL:', req.url);
        console.log('🔍 [Auth Debug] Request method:', req.method);
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('❌ [Auth] Missing or invalid authorization header');
            console.warn('❌ [Auth] Available headers:', Object.keys(req.headers).join(', '));
            return res.status(401).json({ error: 'Missing or invalid token' });
        }

        const token = authHeader.split(' ')[1];
        
        // Use the already configured supabase client
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            console.error('❌ [Auth] Token verification error:', error?.message || 'No user data');
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = data.user;
        console.log('✅ [Auth] Verified user:', req.user.id, req.user.email);
        next();
    } catch (err) {
        console.error('❌ [Auth] Server error in verifyToken:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = verifyToken;
