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

        if (!email || !password || !recheckPassword || !username) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== recheckPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        try {
            // 1. Tạo user trong Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Supabase signUp error:', error);
                // Nếu email đã tồn tại, trả về lỗi phù hợp
                if (error.message.includes('already') || error.message.includes('exists')) {
                    return res.status(400).json({ error: 'Email is already in use' });
                }
                return res.status(400).json({
                    error: error.message || 'Authentication error',
                    details: error,
                });
            }

            const user = data?.user;
            if (!user) {
                return res.status(400).json({ error: 'Failed to create user' });
            }

            console.log('🔄 Processing user:', {
                id: user.id,
                email: user.email,
                confirmed: !!user.email_confirmed_at
            });

            // 2. Sử dụng upsert để tạo hoặc cập nhật user
            // Try with service role first
            let userData, upsertError;
            
            try {
                const result = await supabase
                    .from('users')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        username: username,
                        role: role,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    })
                    .select()
                    .single();
                
                userData = result.data;
                upsertError = result.error;
                
            } catch (error) {
                console.error('Upsert operation failed:', error);
                upsertError = error;
            }

            if (upsertError) {
                console.error('User upsert error:', upsertError);
                
                // If RLS error, try direct SQL approach
                if (upsertError.code === '42501') {
                    console.log('🔄 Trying alternative approach due to RLS...');
                    
                    const { data: sqlResult, error: sqlError } = await supabase
                        .rpc('upsert_user', {
                            user_id: user.id,
                            user_email: user.email,
                            user_username: username,
                            user_role: role
                        });
                    
                    if (sqlError) {
                        console.error('SQL upsert error:', sqlError);
                        return res.status(500).json({ 
                            error: 'Failed to save user information (RLS)',
                            details: sqlError,
                            suggestion: 'Please check database RLS policies'
                        });
                    }
                    
                    userData = sqlResult;
                } else {
                    return res.status(500).json({ 
                        error: 'Failed to save user information',
                        details: upsertError 
                    });
                }
            }

            console.log('✅ User created/updated:', userData);

            // 3. Tạo record trong bảng tương ứng theo role (chỉ khi chưa tồn tại)
            if (role === 'candidate') {
                const { data: existingCandidate, error: candidateCheckError } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!existingCandidate && (!candidateCheckError || candidateCheckError.code === 'PGRST116')) {
                    const { data: newCandidate, error: candidateError } = await supabase
                        .from('candidates')
                        .insert({
                            user_id: user.id,
                            full_name: username,
                        })
                        .select()
                        .single();

                    if (candidateError) {
                        console.error('❌ Candidate insert error:', candidateError);
                    } else {
                        console.log('✅ Created candidate:', newCandidate);
                    }
                } else {
                    console.log('✅ Candidate already exists');
                }

            } else if (role === 'employer') {
                const { data: existingEmployer, error: employerCheckError } = await supabase
                    .from('employers')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!existingEmployer && (!employerCheckError || employerCheckError.code === 'PGRST116')) {
                    const { data: newEmployer, error: employerError } = await supabase
                        .from('employers')
                        .insert({
                            user_id: user.id,
                            company_name: `${username} Company`,
                            contact_person: username,
                        })
                        .select()
                        .single();

                    if (employerError) {
                        console.error('❌ Employer insert error:', employerError);
                    } else {
                        console.log('✅ Created employer:', newEmployer);
                    }
                } else {
                    console.log('✅ Employer already exists');
                }
            }

            // 4. Response với role và username từ database
            const userWithRole = { 
                ...user, 
                role: userData.role, 
                username: userData.username 
            };

            const needsEmailConfirmation = !user.email_confirmed_at;
            
            res.status(201).json({ 
                user: userWithRole,
                message: needsEmailConfirmation 
                    ? 'Registration successful! Please check your email to confirm your account.' 
                    : 'Registration successful!',
                needs_email_confirmation: needsEmailConfirmation
            });

        } catch (error) {
            console.error('❌ Registration error:', error);
            res.status(500).json({ 
                error: 'Registration failed', 
                details: error.message 
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password, role = 'candidate' } = req.body;

            // 1. Authenticate với Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data || !data.user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = data.user;

            if (!user.confirmed_at) {
                return res.status(403).json({
                    error: 'Please confirm your email before logging in.',
                });
            }

            // 2. Lấy thông tin user từ bảng users
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (userError && userError.code !== 'PGRST116') {
                console.error('Error fetching user:', userError);
                return res.status(500).json({ error: 'Database error' });
            }

            // 3. Kiểm tra user và role validation
            if (!existingUser) {
                // User chưa đăng ký trong hệ thống
                return res.status(401).json({ 
                    error: 'Account not found. Please register first.',
                    code: 'ACCOUNT_NOT_FOUND'
                });
            }

            // 4. Kiểm tra role có khớp với role đã đăng ký không
            if (existingUser.role !== role) {
                console.log(`❌ Role mismatch: requested=${role}, registered=${existingUser.role}`);
                return res.status(403).json({ 
                    error: `Invalid role. This account is registered as ${existingUser.role}. Please login with the correct role.`,
                    code: 'ROLE_MISMATCH',
                    registered_role: existingUser.role,
                    attempted_role: role
                });
            }

            const userData = existingUser;
            console.log('✅ Role validation passed:', { 
                email: userData.email, 
                role: userData.role 
            });

            // 5. Kiểm tra và đảm bảo role record tồn tại
            if (role === 'candidate') {
                const { data: existingCandidate, error: candidateError } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!existingCandidate && (!candidateError || candidateError.code === 'PGRST116')) {
                    console.log('⚠️ Candidate record missing, this should not happen for existing users');
                    // Tạo candidate record bị thiếu (fallback)
                    const { data: newCandidate, error: createCandidateError } = await supabase
                        .from('candidates')
                        .insert({
                            user_id: user.id,
                            full_name: userData.username || user.email.split('@')[0],
                        })
                        .select()
                        .single();

                    if (createCandidateError) {
                        console.error('❌ Error creating missing candidate record:', createCandidateError);
                    } else {
                        console.log('✅ Created missing candidate record:', newCandidate);
                    }
                }

            } else if (role === 'employer') {
                const { data: existingEmployer, error: employerError } = await supabase
                    .from('employers')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!existingEmployer && (!employerError || employerError.code === 'PGRST116')) {
                    console.log('⚠️ Employer record missing, this should not happen for existing users');
                    // Tạo employer record bị thiếu (fallback)
                    const { data: newEmployer, error: createEmployerError } = await supabase
                        .from('employers')
                        .insert({
                            user_id: user.id,
                            company_name: `${userData.username} Company`,
                            contact_person: userData.username,
                            status: 'pending' // Mặc định là pending
                        })
                        .select()
                        .single();

                    if (createEmployerError) {
                        console.error('❌ Error creating missing employer record:', createEmployerError);
                    } else {
                        console.log('✅ Created missing employer record:', newEmployer);
                    }
                }
            }

            // 6. Response với đầy đủ thông tin
            const userWithRole = {
                ...user,
                role: userData.role,
                username: userData.username,
            };

            res.status(200).json({
                user: userWithRole,
                access_token: data.session.access_token,
                token: data.session.access_token,
                isFirstLogin: false,
            });

        } catch (error) {
            console.error('❌ Login failed:', error);
            return res.status(500).json({ 
                error: 'Login failed unexpectedly.',
                details: error.message 
            });
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
