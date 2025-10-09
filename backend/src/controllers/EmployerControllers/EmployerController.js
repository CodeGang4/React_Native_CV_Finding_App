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


        await supabase.from('users').update({ avatar: publicURL }).eq('id', companyId);
        console.log('Avatar updated in users table:', publicURL);
        if (!success) {
            return res
                .status(500)
                .json({ error: 'Failed to update company logo' });
        }
        console.log(success);

        console.log('Company logo uploaded and URL saved:', publicURL);

        
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

    async getTopCompanies(req, res) {
        const number = req.query.number || 10; // Mặc định lấy top 10 nếu không có tham số
        try {
            // Lấy thống kê số ứng viên unique cho từng công ty
            const { data: companyStats, error } = await supabase
                .from('employers')
                .select(`
                    user_id,
                    company_name,
                    company_logo,
                    industry,
                    jobs!jobs_employer_id_fkey (
                        id,
                        applications!applications_job_id_fkey (
                            candidate_id
                        )
                    )
                `);

            if (error) {
                throw error;
            }

            // Xử lý dữ liệu để tính số ứng viên unique cho mỗi công ty
            const companiesWithStats = companyStats.map(company => {
                // Lấy tất cả candidate_id từ các applications của các jobs
                const allCandidateIds = [];
                
                if (company.jobs && company.jobs.length > 0) {
                    company.jobs.forEach(job => {
                        if (job.applications && job.applications.length > 0) {
                            job.applications.forEach(application => {
                                allCandidateIds.push(application.candidate_id);
                            });
                        }
                    });
                }

                // Loại bỏ trùng lặp để có số ứng viên unique
                const uniqueCandidates = [...new Set(allCandidateIds)];
                
                return {
                    company_id: company.user_id,
                    company_name: company.company_name,
                    company_logo: company.company_logo,
                    industry: company.industry,
                    total_jobs: company.jobs ? company.jobs.length : 0,
                    total_applications: allCandidateIds.length,
                    unique_candidates: uniqueCandidates.length
                };
            });

            // Sắp xếp theo số ứng viên unique giảm dần
            const topCompanies = companiesWithStats
                .sort((a, b) => b.unique_candidates - a.unique_candidates)
                .slice(0, parseInt(number));

            res.status(200).json(
                topCompanies
            );

        } catch (error) {
            console.error('Error getting top companies:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Lấy thống kê chi tiết cho một công ty cụ thể
    async CompanyAnalytics(req, res) {
        const companyId = req.params.companyId;
        
        try {
            // Lấy thông tin công ty và thống kê ứng tuyển
            const { data: companyData, error } = await supabase
                .from('employers')
                .select(`
                    *,
                    jobs!jobs_employer_id_fkey (
                        id,
                        title,
                        created_at,
                        applications!applications_job_id_fkey (
                            id,
                            candidate_id,
                            status,
                            applied_at,
                            candidates!applications_candidate_id_fkey (
                                full_name,
                                phone,
                                education
                            )
                        )
                    )
                `)
                .eq('user_id', companyId)
                .single();

            if (error) {
                throw error;
            }

            if (!companyData) {
                return res.status(404).json({ error: 'Company not found' });
            }

            // Xử lý thống kê
            const allCandidateIds = [];
            const allApplications = [];
            let totalApplications = 0;

            const jobsWithStats = companyData.jobs.map(job => {
                const jobApplications = job.applications || [];
                totalApplications += jobApplications.length;

                // Thu thập candidate IDs và applications
                jobApplications.forEach(app => {
                    allCandidateIds.push(app.candidate_id);
                    allApplications.push(app);
                });

                return {
                    id: job.id,
                    title: job.title,
                    created_at: job.created_at,
                    applications_count: jobApplications.length,
                    applications: jobApplications
                };
            });

            // Thống kê tổng quan
            const uniqueCandidates = [...new Set(allCandidateIds)];
            const statusStats = {
                pending: allApplications.filter(app => app.status === 'pending').length,
                reviewed: allApplications.filter(app => app.status === 'reviewed').length,
                accepted: allApplications.filter(app => app.status === 'accepted').length,
                rejected: allApplications.filter(app => app.status === 'rejected').length
            };

            const result = {
                company_info: {
                    user_id: companyData.user_id,
                    company_name: companyData.company_name,
                    company_logo: companyData.company_logo,
                    industry: companyData.industry
                },
                statistics: {
                    total_jobs: companyData.jobs.length,
                    total_applications: totalApplications,
                    unique_candidates: uniqueCandidates.length,
                    status_breakdown: statusStats
                },
                jobs_details: jobsWithStats
            };

            res.status(200).json(result);

        } catch (error) {
            console.error('Error getting company application stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new EmployerController();
