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
        try {
            const userId = req.params.userId;
            const file = req.file;
            
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // 1. Upload file to Supabase Storage
            const filePath = `${userId}/${Date.now()}_${file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabaseStorage.storage
                .from('CV_buckets')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });

            if (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload file', details: uploadError.message });
            }

            console.log('File uploaded successfully:', uploadData);

            // 2. Get public URL
            const { data: publicData } = supabase.storage
                .from('CV_buckets')
                .getPublicUrl(filePath);
            
            const publicURL = publicData.publicUrl;
            console.log('Public URL generated:', publicURL);

            // 3. Update candidates table with CV URL
            const { data: updateData, error: updateError } = await supabase
                .from('candidates')
                .update({ cv_url: publicURL })
                .eq('user_id', userId)
                .select();

            if (updateError) {
                console.error('Database update error:', updateError);
                return res.status(500).json({ 
                    error: 'Failed to update CV URL in database', 
                    details: updateError.message 
                });
            }

            if (!updateData || updateData.length === 0) {
                console.error('No candidate record found to update');
                return res.status(404).json({ 
                    error: 'Candidate profile not found. Please create profile first.' 
                });
            }

            console.log('Database updated successfully:', updateData[0]);

            // 4. Verify the update by fetching the updated record
            const { data: userData, error: userError } = await supabase
                .from('candidates')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (userError) {
                console.error('Verification fetch error:', userError);
            } else {
                console.log('Verification - Updated candidate data:', {
                    user_id: userData.user_id,
                    cv_url: userData.cv_url,
                    full_name: userData.full_name
                });
            }

            res.status(200).json(publicURL);
            

        } catch (error) {
            console.error('Unexpected error in uploadCV:', error);
            res.status(500).json({ 
                error: 'Internal server error during CV upload',
                details: error.message 
            });
        }
    }
    async uploadPortfolio(req, res) {
        try {
            const userId = req.params.userId;
            const file = req.file;
            
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            console.log(`Starting Portfolio upload for user: ${userId}`);
            console.log(`File info:`, {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });

            // 1. Upload file to Supabase Storage
            const filePath = `${userId}/${Date.now()}_${file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabaseStorage.storage
                .from('Portfolio_Buckets')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });

            if (uploadError) {
                console.error('Portfolio upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload portfolio file', details: uploadError.message });
            }

            console.log('Portfolio uploaded successfully:', uploadData);

            // 2. Get public URL
            const { data: publicData } = supabase.storage
                .from('Portfolio_Buckets')
                .getPublicUrl(filePath);
            
            const publicURL = publicData.publicUrl;
            console.log('Portfolio URL generated:', publicURL);

            // 3. Update candidates table with portfolio URL
            const { data: candidateUpdateData, error: candidateUpdateError } = await supabase
                .from('candidates')
                .update({ portfolio: publicURL })
                .eq('user_id', userId)
                .select();

            if (candidateUpdateError) {
                console.error('Candidate portfolio update error:', candidateUpdateError);
                return res.status(500).json({ 
                    error: 'Failed to update portfolio URL in candidates table', 
                    details: candidateUpdateError.message 
                });
            }

            // 4. Update users table with avatar URL
            const { data: userUpdateData, error: userUpdateError } = await supabase
                .from('users')
                .update({ avatar: publicURL })
                .eq('id', userId)
                .select();

            if (userUpdateError) {
                console.error(' User avatar update error:', userUpdateError);
                return res.status(500).json({ 
                    error: 'Failed to update avatar URL in users table', 
                    details: userUpdateError.message 
                });
            }

            console.log('Portfolio uploaded and URLs saved successfully:', {
                portfolio_url: publicURL,
                candidate_updated: candidateUpdateData?.length > 0,
                user_updated: userUpdateData?.length > 0
            });


            res.status(200).json({ 
                portfolio_url: publicURL,
                message: 'Portfolio uploaded and saved successfully'
            });

        } catch (error) {
            console.error('Unexpected error in uploadPortfolio:', error);
            res.status(500).json({ 
                error: 'Internal server error during portfolio upload',
                details: error.message 
            });
        }
    }
    async getAllCandidates(req, res) {
        const { data, error } = await supabase
            .from('candidates')
            .select('*');
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No candidates found' });
        }
        res.status(200).json(data);
    }
}

module.exports = new CandidatesController();
