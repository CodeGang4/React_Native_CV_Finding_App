const supabase = require('../supabase/config');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid token' });
        }

        const token = authHeader.split(' ')[1];
        const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        supabase.auth.setAuth(token); // Sử dụng setAuth tạm thời để getUser (nếu phiên bản cũ)

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            console.error('Token verification error:', error?.message || 'No user data');
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = data.user;
        console.log('Verified user:', req.user.id);
        next();
    } catch (err) {
        console.error('Server error in verifyToken:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = verifyToken;
