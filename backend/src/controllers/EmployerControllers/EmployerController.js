const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
);
const redis = require('../../redis/config');
class EmployerController {
    async getCompanyInfo(req, res) {
        const companyId = req.params.companyId;
        try {
            const { data, error } = await supabase
                .from('employers')
                .select('*')
                .eq('user_id', companyId)
                .single();
            if (error) {
                throw error;
            }
            if (!data) {
                return res.status(404).json({ error: 'Company not found' });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching company info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // select all company without pagination and ordering. Suit for Admin dashboard
    async getAllCompany(req, res) {
        try {
            const { data, error } = await supabase
                .from('employers')
                .select('*');
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                return res.status(404).json({ error: 'No companies found' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching all companies:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // select all verified company for client and employer listing
    async getVerifiedCompany(req, res) {
        try {
            const { data, error } = await supabase
                .from('employers')
                .select('*')
                .eq('isverified', true);
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'No verified companies found' });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching verified companies:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async verifyCompany(req, res) {
        const companyId = req.params.companyId;
        try {
            const { data, error } = await supabase
                .from('employers')
                .update({
                    isverified: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', companyId)
                .select();
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'Company not found or not updated' });
            }
            res.status(200).json(data[0]);
        } catch (error) {
            console.error('Error verifying company:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

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

    async updateCompanyName(req, res) {
        const companyId = req.params.companyId;
        const { company_name } = req.body;
        if (!company_name) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        const { data, error } = await supabase
            .from('employers')
            .update({ company_name })
            .eq('user_id', companyId)
            .select();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Employer not found or not updated' });
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .update({ username: company_name })
            .eq('id', companyId)
            .select();
        if (userError) {
            return res.status(400).json({ error: userError.message });
        }
        if (!userData || userData.length === 0) {
            return res
                .status(404)
                .json({ error: 'User not found or not updated' });
        }

        res.status(200).json(data[0]);
    }
}

module.exports = new EmployerController();
