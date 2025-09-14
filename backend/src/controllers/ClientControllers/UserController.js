const supabase = require('../../supabase/config');
const redis = require('../../redis/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class UserController {
    async getUserProfile(req, res) {
        const userId = req.params.userId;

        try {
            const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            // Redis log
            try {
                await redis.setEx(`log:getUserProfile:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'getUserProfile', userId, time: new Date().toISOString() }));
            } catch (err) {
                console.error('Redis log error (getUserProfile):', err);
            }
            res.status(200).json({ user: data });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    async updateUserRole(req, res) {
        const userId = req.params.userId;
        const { role } = req.body;
        const validRoles = ['candidate', 'employer', 'admin'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        try {
            const { data, error } = await supabase.from('users').update({ role }).eq('id', userId).select();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            const updatedUser = data && data[0];
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (role === 'candidate') {
                await supabase.from('candidates').upsert({
                    user_id: updatedUser.id,
                    full_name: updatedUser.username,
                });
            } else if (role === 'employer') {
                await supabase.from('employers').upsert({
                    user_id: updatedUser.id,
                    company_name: updatedUser.username,
                });
            }

            // Redis log
            try {
                await redis.setEx(`log:updateUserRole:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'updateUserRole', userId, role, time: new Date().toISOString() }));
            } catch (err) {
                console.error('Redis log error (updateUserRole):', err);
            }
            res.status(200).json({ user: updatedUser });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
    async updateProfile(req, res) {
        const userId = req.params.userId;
        const genders = ['male', 'female', 'other'];

        const {
            date_of_birth,
            gender,
            phone,
            address,
            education,
            experience,
            skills,
            job_preferences
        } = req.body;
        if (!genders.includes(gender)) {
            return res.status(400).json({ error: 'Invalid gender' });
        }

        const { data, error } = await supabase
            .from('candidates')
            .update({
                date_of_birth,
                gender,
                phone,
                address,
                education,
                experience,
                skills,
                job_preferences
            })
            .eq('user_id', userId)
            .select(); // Thêm .select() để trả về dữ liệu vừa cập nhật

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Candidate not found or not updated' });
        }
        // Redis log
        try {
            await redis.setEx(`log:updateProfile:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'updateProfile', userId, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (updateProfile):', err);
        }
        res.status(200).json(data[0]);
    }

    async uploadCV(req, res) {
        const userId = req.params.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `${userId}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabaseStorage.storage.from('CV_buckets').upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage.from('CV_buckets').getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;

        await supabase.from('candidates').update({ cv_url: publicURL }).eq('user_id', userId);
        console.log('CV uploaded and URL saved:', publicURL);

        // Redis log
        try {
            await redis.setEx(`log:uploadCV:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'uploadCV', userId, cv_url: publicURL, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (uploadCV):', err);
        }
        res.status(200).json({ cv_url: publicURL });
    }
    async uploadPortfolio(req, res) {
        const userId = req.params.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `${userId}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabaseStorage.storage.from('Portfolio_Buckets').upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage.from('Portfolio_Buckets').getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;
        await supabase.from('candidates').update({ portfolio: publicURL }).eq('user_id', userId);
        console.log('Portfolio uploaded and URL saved:', publicURL);

        // Redis log
        try {
            await redis.setEx(`log:uploadPortfolio:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'uploadPortfolio', userId, portfolio_url: publicURL, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (uploadPortfolio):', err);
        }
        res.status(200).json({ portfolio_url: publicURL });
    }
    async uploadCompanyLogo(req, res) {
        const userId = req.params.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `${userId}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabaseStorage.storage.from('Portfolio_Buckets').upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage.from('Portfolio_Buckets').getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;
        await supabase.from('candidates').update({ portfolio: publicURL }).eq('user_id', userId);
        console.log('Portfolio uploaded and URL saved:', publicURL);

        // Redis log
        try {
            await redis.setEx(`log:uploadCompanyLogo:${userId}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'uploadCompanyLogo', userId, portfolio_url: publicURL, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (uploadCompanyLogo):', err);
        }
        res.status(200).json({ portfolio_url: publicURL });
    }
}

module.exports = new UserController();
