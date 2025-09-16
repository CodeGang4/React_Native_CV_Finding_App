const supabase = require('../../supabase/config');
const redis = require('../../redis/config');
const bcrypt = require('bcrypt');
class AuthController {
    async googleLogin(req, res) {
        try {
            const { id_token } = req.body;  // nhận từ client Expo

            if (!id_token) {
                return res.status(400).json({ error: "Thiếu id_token" });
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: id_token,
            });

            if (error) return res.status(400).json({ error: error.message });
            res.json({ session: data.session, user: data.user });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    async register(req, res) {
        const { email, password, recheckPassword, username } = req.body;
        console.log('register request body:', req.body);

        if (!email || !password || !recheckPassword || !username) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await supabase.from('users').select('id').eq('email', email).single();

        if (existingUser.data) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        if (password !== recheckPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,

        });

        if (error) {
            console.error('Supabase signUp error:', error);
            return res.status(400).json({ error: error.message || 'Database error saving new user', details: error });
        }

        const user = data?.user || null;

        // Lưu cache redis (nếu cần)
        if (user) {
            const key = `user:${user.id || email || username}`;
            const value = JSON.stringify({ email, createdAt: new Date().toISOString() });
            const ttlSeconds = 60 * 60 * 24; // 24h
            try {
                await redis.setEx(key, ttlSeconds, value);
                console.log('Wrote user to redis:', key);
            } catch (err) {
                console.error('Redis write failed during registration:', err);
            }
        }
        if (user) {
            try {
                await supabase.from('users').upsert({
                    id: user.id,
                    email: user.email,
                    username: username,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            } catch (err) {
                console.error('Insert error:', err);
            }
        }

        res.status(201).json({ user });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log('login request body:', req.body);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!data || !data.user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            if (error) return res.status(400).json({ error: error.message });

            // Write login info to Redis (do not block login on Redis errors)
            const user = data.user;
            const key = `login:${user.id || email}`;
            const value = JSON.stringify({ email, loginAt: new Date().toISOString() });
            const ttlSeconds = 60 * 60 * 24; // 24 hours
            try {
                await redis.setEx(key, ttlSeconds, value);
                console.log('Wrote login info to redis:', key);
            } catch (err) {
                console.error('Redis write failed during login:', err);
            }
            if (!user.confirmed_at) {
                return res.status(403).json({ error: "Please confirm your email before logging in." });
            }

            // First login flag logic
            const firstLoginKey = `firstlogin:${user.id || email}`;
            const now = new Date().toISOString();
            let isFirstLogin = false;
            try {
                const exists = await redis.get(firstLoginKey);
                if (!exists) {
                    await redis.set(firstLoginKey, now);
                    isFirstLogin = true;
                    console.log('Saved first login time:', now);
                }
            } catch (err) {
                console.error('Redis error saving first login:', err);
            }

            res.status(200).json({ user: data.user, access_token: data.session.access_token, isFirstLogin: isFirstLogin });
        } catch (error) {
            return res.status(500).json({ error: "Login failed unexpectedly." });
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Missing token' });
            }
            supabase.auth.setAuth(token); // Sử dụng setAuth tạm thời

            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error.message);
                return res.status(400).json({ error: error.message });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (err) {
            console.error('Server error in logout:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
    async resetPasswordForEmail(req, res, next) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            const { data, error } = await supabase.auth.api.resetPasswordForEmail(email);
            if (error) {
                console.error('Error sending password reset email:', error.message);
                return res.status(400).json({ error: error.message });
            }

            // Write reset request info to Redis (do not block response on Redis errors)
            const key = `reset:${email}`;
            const value = JSON.stringify({ email, resetRequestedAt: new Date().toISOString() });
            const ttlSeconds = 60 * 30; // 30 minutes
            try {
                await redis.setEx(key, ttlSeconds, value);
                console.log('Wrote password reset request to redis:', key);
            } catch (err) {
                console.error('Redis write failed during password reset:', err);
            }

            res.status(200).json({ message: 'Password reset email sent successfully' });
        } catch (err) {
            console.error('Server error in forgetPassword:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new AuthController();
