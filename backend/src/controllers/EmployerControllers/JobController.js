const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');
const redis = require('../../redis/config');

class JobController {
    async getJobs(req, res) {
        const { data, error } = await supabase.from('jobs').select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Log riêng (không ảnh hưởng cache)
        try {
            await redis.setEx(
                `log:getJobs:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'getJobs',
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (getJobs):', err);
        }

        res.status(200).json(data);
    }

    //[GET] /getJobByCompanyId/:companyId : Get jobs by company ID]
    async getJobByCompanyId(req, res) {
        const companyId = req.params.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const cacheKey = `jobs:company:${companyId}`;

        try {
            // 1. Kiểm tra cache trước
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log('✅ Cache hit:', cacheKey);
                return res.status(200).json(JSON.parse(cached));
            }

            console.log('❌ Cache miss:', cacheKey);

            // 2. Query DB nếu cache không có
            const { data, error } = await supabase
                .from('jobs')
                .select()
                .eq('employer_id', companyId);

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            // 3. Lưu vào cache (TTL = 1h)
            await redis.setEx(cacheKey, 60 * 60, JSON.stringify(data));

            // 4. Log riêng (không ảnh hưởng cache)
            await redis.setEx(
                `log:getJobByCompanyId:${companyId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'getJobByCompanyId',
                    companyId,
                    time: new Date().toISOString(),
                }),
            );

            // 5. Trả dữ liệu cho client
            res.status(200).json(data);
        } catch (err) {
            console.error('getJobByCompanyId error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getJobDetail(req, res) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        try {
            // Check cache trước
            const cacheKey = `job:${jobId}`;
            const cachedJob = await redis.get(cacheKey);

            if (cachedJob) {
                // Redis hit
                return res.status(200).json(JSON.parse(cachedJob));
            }

            // Nếu không có cache thì query DB
            const { data, error } = await supabase
                .from('jobs')
                .select()
                .eq('id', jobId)
                .single();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data) {
                return res.status(404).json({ error: 'Job not found' });
            }

            // Lưu vào Redis với TTL 1 ngày
            await redis.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(data));

            // Log lại action (async, không chặn response)
            redis
                .setEx(
                    `log:getJobDetail:${jobId}:${Date.now()}`,
                    60 * 60 * 24,
                    JSON.stringify({
                        action: 'getJobDetail',
                        jobId,
                        time: new Date().toISOString(),
                    }),
                )
                .catch((err) => console.error('Redis log error:', err));

            return res.status(200).json(data);
        } catch (err) {
            console.error('getJobDetail error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    //[POST] /addJob/:companyId : Add a new job
    async addJob(req, res) {
        const companyId = req.params.companyId;

        const company = await supabase
            .from('employers')
            .select('*')
            .eq('user_id', companyId)
            .single();
        if (!company) {
            return res.status(400).json({ error: 'Company does not exist' });
        }

        const jobTypes = ['fulltime', 'parttime', 'internship', 'freelance'];
        const requiredFields = [
            'title',
            'description',
            'requirements',
            'location',
            'job_type',
            'salary',
            'quantity',
            'position',
            'education',
            'exprired_date',
            'isAccepted',
        ];
        const missingFields = requiredFields.filter(
            (field) => req.body[field] === undefined || req.body[field] === '',
        );

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res
                .status(400)
                .json({ error: 'Missing fields', fields: missingFields });
        }

        // Check employer existence
        const { data: employerData, error: employerError } = await supabase
            .from('employers')
            .select('id')
            .eq('user_id', companyId)
            .single();
        if (employerError || !employerData) {
            return res.status(400).json({ error: 'Employer does not exist' });
        }

        const {
            title,
            description,
            requirements,
            location,
            job_type,
            quantity,
            position,
            education,
            exprired_date,
            salary,
            isAccepted,
        } = req.body;

        if (!jobTypes.includes(job_type)) {
            return res.status(400).json({ error: 'Invalid job type' });
        }
        const { data, error } = await supabase
            .from('jobs')
            .upsert({
                title,
                description,
                requirements,
                location,
                job_type,
                salary,
                quantity,
                position,
                isAccepted,
                education,
                exprired_date,
                employer_id: companyId,
            })
            .select(); // Thêm .select() để lấy lại dữ liệu vừa thêm
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Redis log
        try {
            await redis.setEx(
                `log:addJob:${companyId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'addJob',
                    companyId,
                    job: { title, location },
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (addJob):', err);
        }
        res.status(200).json(data);
    }

    //[DELETE] /deleteJob/:jobId : Delete a job
    async deleteJob(req, res) {
        const jobId = req.params.jobId;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        const { data, error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Job not found or not deleted' });
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    }

    //[PUT] /updateJob/:jobId : Update a job
    async updateJob(req, res) {
        const jobId = req.params.jobId;
        const {
            title,
            description,
            requirements,
            location,
            job_type,
            quantity,
            position,
            education,
            exprired_date,
            salary,
            isAccepted,
        } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        const { data, error } = await supabase
            .from('jobs')
            .update({
                title,
                description,
                requirements,
                location,
                job_type,
                salary,
                quantity,
                position,
                isAccepted,
                education,
                exprired_date,
                updated_at: new Date(),
            })
            .eq('id', jobId)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Job not found or not updated' });
        }

        // Redis log
        try {
            await redis.setEx(
                `log:updateJob:${jobId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'updateJob',
                    jobId,
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (updateJob):', err);
        }
        res.status(200).json(data[0]);
    }
}

module.exports = new JobController();
