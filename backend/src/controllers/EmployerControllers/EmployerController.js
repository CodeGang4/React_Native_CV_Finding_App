const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
);
const redis = require('../../redis/config');
class EmployerController {
    async updateInfo(req, res) {
        const companyId = req.params.companyId;
        const {
            company_website,
            company_size,
            industry,
            company_address,
            contact_person,
            description,
        } = req.body;

        if (
            !company_website ||
            !company_size ||
            !industry ||
            !company_address ||
            !contact_person ||
            !description
        ) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const { data, error } = await supabase
            .from('employers')
            .update({
                company_website,
                company_size,
                industry,
                company_address,
                contact_person,
                description,
            })
            .eq('user_id', companyId)
            .select();

        // Thêm .select() để trả về dữ liệu vừa cập nhật

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Employer not found or not updated' });
        }
        res.status(200).json(data[0]);
    }

    async uploadCompanyLogo(req, res) {
        const companyId = req.params.companyId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `${companyId}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabaseStorage.storage
            .from('Company_Logo_Buckets')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabase.storage
            .from('Company_Logo_Buckets')
            .getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;
        const success = await supabase
            .from('employers')
            .update({ company_logo: publicURL })
            .eq('user_id', companyId);

        if (!success) {
            return res
                .status(500)
                .json({ error: 'Failed to update company logo' });
        }
        console.log(success);

        console.log('Company logo uploaded and URL saved:', publicURL);

        // Redis log
        try {
            await redis.setEx(
                `log:uploadCompanyLogo:${companyId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'uploadCompanyLogo',
                    companyId,
                    logo_url: publicURL,
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (uploadCompanyLogo):', err);
        }
        res.status(200).json({ logo_url: publicURL });
    }
}

module.exports = new EmployerController();
