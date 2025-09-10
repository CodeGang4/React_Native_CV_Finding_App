const supabase = require('../../supabase/config');
const { createClient } = require('@supabase/supabase-js');


class JobController {

    //[GET] /getJobs : Get all jobs
    async getJobs(req, res) {

        const { data, error } = await supabase
            .from('jobs')
            .select()
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json(data);
    }


    //[GET] /getJobByCompanyId/:companyId : Get jobs by company ID
    async getJobByCompanyId(req, res) {
        const companyId = req.params.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }
        const { data, error } = await supabase
            .from('jobs')
            .select()
            .eq('employer_id', companyId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json(data);
    }

    //[GET] /getJobDetail/:jobId : Get job detail by job ID
    async getJobDetail(req, res) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        const { data, error } = await supabase
            .from('jobs')
            .select()
            .eq('id', jobId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json(data);
    }

    //[POST] /addJob/:companyId : Add a new job
    async addJob(req, res) {
        const companyId = req.params.companyId;
        const jobTypes = ['fulltime', 'parttime', 'internship', 'freelance'];
        const requiredFields = [
            'title', 'description', 'requirements', 'location', 'job_type',
            'salary', 'quantity', 'position', 'education', 'exprired_date', 'isAccepted'
        ];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === '');

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({ error: 'Missing fields', fields: missingFields });
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

        const { title, description, requirements, location, job_type, quantity, position, education, exprired_date, salary, isAccepted } = req.body;

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
                employer_id: companyId
            }).select(); // Thêm .select() để lấy lại dữ liệu vừa thêm
        if (error) {
            return res.status(400).json({ error: error.message });
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
            .eq('id', jobId)
            .eq('employer_id', companyId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Job not found or not deleted' });
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    }

    //[PUT] /updateJob/:jobId : Update a job
    async updateJob(req, res) {
        const jobId = req.params.jobId;
        const { title, description, requirements, location, job_type, quantity, position, education, exprired_date, salary, isAccepted } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }


        const { data, error } = await supabase.from('jobs').update({
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
            updated_at: new Date()
        }).eq('id', jobId).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Job not found or not updated' });
        }
        res.status(200).json(data[0]);
    }
}

module.exports = new JobController();


