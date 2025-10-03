const supabase = require('../../supabase/config');
const bcrypt = require('bcrypt');
class AuthController {
    async googleLogin(req, res) {
        try {
            const { id_token } = req.body; // nhận từ client Expo

            if (!id_token) {
                return res.status(400).json({ error: 'Thiếu id_token' });
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
        const {
            email,
            password,
            recheckPassword,
            username,
            role = 'candidate',
        } = req.body;
        console.log('register request body:', req.body);

        if (!email || !password || !recheckPassword || !username) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser.data) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        if (password !== recheckPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error('Supabase signUp error:', error);
            return res.status(400).json({
                error: error.message || 'Database error saving new user',
                details: error,
            });
        }

        const user = data?.user || null;

        if (user) {
            try {
                // Tạo user trong bảng users
                const { data: newUser, error: userInsertError } = await supabase
                    .from('users')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        username: username,
                        role: role,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (userInsertError) {
                    console.error('User insert error:', userInsertError);
                } else {
                    console.log('Created user:', newUser);

                    // Tạo thông tin trong bảng tương ứng theo role
                    if (role === 'candidate') {
                        const { data: newCandidate, error: candidateError } =
                            await supabase
                                .from('candidates')
                                .insert({
                                    user_id: user.id,
                                    full_name:
                                        username || user.email.split('@')[0],
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                })
                                .select()
                                .single();

                        if (candidateError) {
                            console.error(
                                'Candidate insert error:',
                                candidateError,
                            );
                        } else {
                            console.log('Created candidate:', newCandidate);
                        }
                    } else if (role === 'employer') {
                        const { data: newEmployer, error: employerError } =
                            await supabase
                                .from('employers')
                                .insert({
                                    user_id: user.id,
                                    company_name: `${username || user.email.split('@')[0]} Company`,
                                    contact_person:
                                        username || user.email.split('@')[0],
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                })
                                .select()
                                .single();

                        if (employerError) {
                            console.error(
                                'Employer insert error:',
                                employerError,
                            );
                        } else {
                            console.log('Created employer:', newEmployer);
                        }
                    }
                }
            } catch (err) {
                console.error('Database insert error:', err);
            }
        }

        // Add role to user object before sending response
        const userWithRole = user ? { ...user, role: role } : null;

        res.status(201).json({ user: userWithRole });
    }

    async login(req, res) {
        try {
            const { email, password, role = 'candidate' } = req.body;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (!data || !data.user) {
                return res
                    .status(401)
                    .json({ error: 'Invalid email or password' });
            }

            if (error) return res.status(400).json({ error: error.message });

            const user = data.user;

            if (!user.confirmed_at) {
                return res.status(403).json({
                    error: 'Please confirm your email before logging in.',
                });
            }

            // Lấy thông tin user từ bảng users để có username
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            // Tạo/kiểm tra record theo role
            if (role === 'candidate') {
                const { data: existingCandidate, error: candidateError } =
                    await supabase
                        .from('candidates')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                if (candidateError && candidateError.code === 'PGRST116') {
                    // Tạo candidate mới với username từ bảng users
                    await supabase.from('candidates').insert({
                        user_id: user.id,
                        full_name:
                            existingUser?.username || user.email.split('@')[0],
                    });
                }
            } else if (role === 'employer') {
                const { data: existingEmployer, error: employerError } =
                    await supabase
                        .from('employers')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                if (employerError && employerError.code === 'PGRST116') {
                    // Tạo employer mới
                    await supabase.from('employers').insert({
                        user_id: user.id,
                        company_name: existingUser.username,
                    });
                }
            }

            // Add role to user object
            const userWithRole = {
                ...data.user,
                role: role,
            };

            res.status(200).json({
                user: userWithRole,
                access_token: data.session.access_token,
                token: data.session.access_token,
                isFirstLogin: false,
            });
        } catch (error) {
            console.error('Login failed:', error);
            return res
                .status(500)
                .json({ error: 'Login failed unexpectedly.' });
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
            const { data, error } =
                await supabase.auth.api.resetPasswordForEmail(email);
            if (error) {
                console.error(
                    'Error sending password reset email:',
                    error.message,
                );
                return res.status(400).json({ error: error.message });
            }

            res.status(200).json({
                message: 'Password reset email sent successfully',
            });
        } catch (err) {
            console.error('Server error in forgetPassword:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    // Debug endpoints
    async checkCandidates(req, res) {
        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json({ candidates, count: candidates.length });
    }

    async checkUsers(req, res) {
        const { data: users, error } = await supabase.from('users').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json({ users, count: users.length });
    }
}

module.exports = new AuthController();
