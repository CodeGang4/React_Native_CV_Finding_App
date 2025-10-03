const supabase = require('../../supabase/config');

class ApplicationController {
    async createApplication(req, res) {
        const { candidate_id, job_id } = req.body;
        if (!candidate_id || !job_id) {
            return res
                .status(400)
                .json({ error: 'Missing candidate_id or job_id' });
        }

        const existingApplication = await supabase
            .from('applications')
            .select('*')
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .single();
        if (existingApplication.data) {
            return res.status(400).json({
                error: 'Application already exists for this candidate and job',
            });
        }

        const { data: candidateData, error: candidateError } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', candidate_id)
            .single();
        if (candidateError || !candidateData) {
            return res.status(400).json({ error: 'Candidate does not exist' });
        }

        console.log({ candidateData, cv_url: candidateData.cv_url });

        const { data, error } = await supabase
            .from('applications')
            .insert({
                candidate_id: candidate_id,
                cv_url: candidateData.cv_url,
                job_id,
                status: 'pending',
                applied_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select();

        console.log({ data, error });

        if (error) {
            return res
                .status(500)
                .json({ error: 'Failed to create application' });
        }

        res.status(201).json(data);
    }
    async getApplicationByCandidate(req, res) {
        const { candidate_id } = req.params;

        if (!candidate_id) {
            return res.status(400).json({ error: 'Missing candidate_id' });
        }

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('candidate_id', candidate_id);

        if (error) {
            return res
                .status(500)
                .json({ error: 'Failed to retrieve applications' });
        }

        res.status(200).json(data);
    }

    async getAllCandidates(req, res) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('candidates(*),applied_at,status')
                .eq('job_id', jobId);

            if (error) {
                return res
                    .status(500)
                    .json({ error: 'Failed to retrieve candidates' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async calculateCompetitionRate(req, res) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        try {
            // Lấy số lượng ứng viên đã nộp đơn cho công việc
            const { data: applicationsData, error: applicationsError } =
                await supabase
                    .from('applications')
                    .select('id', { count: 'exact' })
                    .eq('job_id', jobId);
            if (applicationsError) {
                return res
                    .status(500)
                    .json({ error: 'Failed to retrieve applications' });
            }
            const applicationCount = applicationsData
                ? applicationsData.length
                : 0;

            // Lấy số lượng vị trí tuyển dụng cho công việc
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('quantity')
                .eq('id', jobId)
                .single();
            if (jobError) {
                console.log({ jobError });
                return res
                    .status(500)
                    .json({ error: 'Failed to retrieve job details' });
            }
            const numberOfPositions = jobData ? jobData.quantity : 1; // Mặc định là 1 nếu không có dữ liệu
            const competitionRate =
                numberOfPositions > 0
                    ? (applicationCount / numberOfPositions) * 100
                    : 0;

            return res.status(200).json({
                job_id: jobId,
                application_count: applicationCount,
                number_of_positions: numberOfPositions,
                competition_rate: `${competitionRate.toFixed(2)}%`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateStatus(req, res) {
        const applicationId = req.params.applicationId;
        const { status } = req.body;
        const validStatuses = [
            'pending',
            'reviewed',
            'interviewed',
            'hired',
            'rejected',
        ];
        if (!applicationId || !validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ error: 'Invalid application ID or status' });
        }
        const { data, error } = await supabase
            .from('applications')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', applicationId)
            .select();
        if (error) {
            return res
                .status(500)
                .json({ error: 'Failed to update application status' });
        }
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ error: 'Application not found or not updated' });
        }
        res.status(200).json(data[0]);
    }

    async getAllApplicationsByStatus(req, res) {
        const job_id = req.params.job_id;
        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        const { status } = req.body;
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('status', status)
            .eq('job_id', job_id);
        if (error) {
            return res
                .status(500)
                .json({ error: 'Failed to retrieve applications' });
        }
        res.status(200).json(data);
    }
}
module.exports = new ApplicationController();
