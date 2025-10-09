const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
);
const redis = require('../../redis/config');
class CandidatesController {

    async getProfile(req, res) {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            const cacheKey = `profile:${userId}`;

            // 1. Check Redis cache
            const redisGetStart = Date.now();
            const cachedProfile = await redis.get(cacheKey);
            const redisGetTime = Date.now() - redisGetStart;

            if (cachedProfile) {
                console.log(
                    `[getProfile] Cache HIT | userId=${userId} | key=${cacheKey} | Redis GET=${redisGetTime} ms`,
                );
                return res.status(200).json(JSON.parse(cachedProfile));
            } else {
                console.log(
                    `[getProfile] Cache MISS | userId=${userId} | key=${cacheKey} | Redis GET=${redisGetTime} ms`,
                );
            }

            // 2. Query Supabase nếu chưa có cache
            const dbStart = Date.now();
            const { data, error } = await supabase
                .from('candidates')
                .select()
                .eq('user_id', userId)
                .single();
            const dbQueryTime = Date.now() - dbStart;
            console.log(
                `[getProfile] Supabase query time: ${dbQueryTime} ms | userId=${userId}`,
            );

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // 3. Lưu cache 1 ngày
            const cacheSetStart = Date.now();
            await redis.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(data));
            const cacheSetTime = Date.now() - cacheSetStart;
            console.log(
                `[getProfile] Redis SETEX time: ${cacheSetTime} ms | userId=${userId}`,
            );

            // 4. Log action (async, không chặn response)
            setImmediate(() => {
                redis
                    .setEx(
                        `log:getProfile:${userId}:${Date.now()}`,
                        60 * 60 * 24,
                        JSON.stringify({
                            action: 'getProfile',
                            userId,
                            time: new Date().toISOString(),
                        }),
                    )
                    .catch((err) => console.error('Redis log error:', err));
            });

            return res.status(200).json(data);
        } catch (err) {
            console.error('getProfile error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateProfile(req, res) {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        console.log(userId);
        const genders = ['male', 'female', 'other'];

        const {
            date_of_birth,
            gender,
            phone,
            address,
            education,
            experience,
            skills,
            job_preferences,
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
                job_preferences,
            })
            .eq('user_id', userId)
            .select(); // Thêm .select() để trả về dữ liệu vừa cập nhật

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Candidate not found or not updated' });
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
        const { data, error } = await supabaseStorage.storage
            .from('CV_buckets')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage
            .from('CV_buckets')
            .getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;

        await supabase
            .from('candidates')
            .update({ cv_url: publicURL })
            .eq('user_id', userId);
        console.log('CV uploaded and URL saved:', publicURL);

        res.status(200).json({ cv_url: publicURL });
    }
    async uploadPortfolio(req, res) {
        const userId = req.params.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `${userId}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabaseStorage.storage
            .from('Portfolio_Buckets')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage
            .from('Portfolio_Buckets')
            .getPublicUrl(filePath);
        // const publicURL = publicData.publicUrl;
        await supabase
            .from('candidates')
            .update({ portfolio: publicData.publicUrl })
            .eq('user_id', userId);

        await supabase.from('users').update({ avatar: publicData.publicUrl }).eq('id', userId);
        console.log('Portfolio uploaded and URL saved:', publicData.publicUrl);

        res.status(200).json({ portfolio_url: publicData.publicUrl });
    }
}

module.exports = new CandidatesController();
