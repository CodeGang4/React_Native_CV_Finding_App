const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class CandidatesController {

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

        res.status(200).json({ portfolio_url: publicURL });
    }

}

module.exports = new CandidatesController();
