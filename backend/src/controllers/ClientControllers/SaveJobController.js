const supabase = require('../../supabase/config');
const redis = require('../../redis/config');

class SaveJobController {
    //[GET] /getJobs : Get all saved jobs with details
    async getJobsByCandidates(req, res) {
        const candidate_id = req.params.candidate_id;
        if (!candidate_id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }

        try {
            const { data, error } = await supabase
                .from('saved_jobs')
                .select(
                    `
                    *,
                    jobs!saved_jobs_job_id_fkey (
                        *,
                        employers!jobs_employer_id_fkey (
                            company_name,
                            company_logo,
                            company_website,
                            company_address,
                            industry,
                            contact_person
                        )
                    )
                `,
                )
                .eq('candidate_id', candidate_id)
                .order('saved_at', { ascending: false });

            if (error) {
                console.error('[getJobsByCandidates] Error:', error.message);
                return res.status(400).json({ error: error.message });
            }

            res.status(200).json(data);
        } catch (err) {
            console.error('[getJobsByCandidates] Internal error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getSavedJobsDetails(req, res) {
        const candidate_id = req.params.candidate_id;
        const job_id = req.params.job_id;

        if (!candidate_id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }
        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        try {
            // Kiểm tra xem job có được saved bởi candidate này không
            const { data: savedJob, error: savedJobError } = await supabase
                .from('saved_jobs')
                .select('*')
                .eq('candidate_id', candidate_id)
                .eq('job_id', job_id)
                .single();

            if (savedJobError) {
                console.error(
                    '[getSavedJobsDetails] Saved job error:',
                    savedJobError.message,
                );
                return res
                    .status(404)
                    .json({ error: 'Job not saved by this candidate' });
            }

            // Lấy chi tiết job từ bảng jobs
            const { data: jobDetails, error: jobError } = await supabase
                .from('jobs')
                .select(
                    `
                    *,
                    employers!jobs_employer_id_fkey (
                        company_name,
                        company_logo,
                        company_website,
                        company_address,
                        industry,
                        contact_person
                    )
                `,
                )
                .eq('id', job_id)
                .single();

            if (jobError) {
                console.error(
                    '[getSavedJobsDetails] Job details error:',
                    jobError.message,
                );
                return res.status(404).json({ error: 'Job not found' });
            }

            // Kết hợp thông tin saved job và job details
            const result = {
                ...savedJob,
                job_details: jobDetails,
            };

            return res.status(200).json(result);
        } catch (err) {
            console.error('[getSavedJobsDetails] Internal error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async saveJobs(req, res) {
        const candidate_id = req.params.candidate_id;
        const job_id = req.body.job_id;
        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        if (!candidate_id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }
        console.log({ candidate_id, job_id });
        // Kiểm tra đã lưu job này chưa
        const { data: existed, error: existError } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .single();
        if (existError && existError.code !== 'PGRST116') {
            console.error({ existError });
            // PGRST116: No rows found
            return res.status(400).json({ error: existError.message });
        }
        if (existed) {
            return res.status(400).json({ error: 'Job already saved' });
        }

        const { data, error } = await supabase
            .from('saved_jobs')
            .upsert([
                { candidate_id, job_id, saved_at: new Date().toISOString() },
            ])
            .select();

        if (error) {
            console.error({ error });
            return res.status(400).json({ error: error.message });
        }
        // Redis log
        try {
            await redis.setEx(
                `log:saveJob:${candidate_id}:${job_id}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'saveJob',
                    candidate_id,
                    job_id,
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (saveJob):', err);
        }
        res.status(200).json(data);
    }

    //[DELETE] /unsaveJob/:candidate_id : Unsave a job
    async unsaveJob(req, res) {
        try {
            const candidate_id = req.params.candidate_id;
            const job_id = req.body.job_id;

            if (!job_id) {
                return res.status(400).json({ error: 'Job ID is required' });
            }
            if (!candidate_id) {
                return res.status(400).json({ error: 'Candidate ID is required' });
            }

            console.log(`Unsaving job for candidate: ${candidate_id}, job: ${job_id}`);

            // Optional: Verify job exists before deleting (for better error messages)
            const { data: existingSave, error: checkError } = await supabase
                .from('saved_jobs')
                .select('id')
                .eq('candidate_id', candidate_id)
                .eq('job_id', job_id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('[unsaveJob] Check error:', checkError);
                return res.status(500).json({ error: 'Database error while checking saved job' });
            }

            if (!existingSave) {
                console.log(`Job not saved by this candidate: ${candidate_id} -> ${job_id}`);
                return res.status(404).json({ error: 'Job is not saved by this candidate' });
            }

            // Perform delete operation
            const { data, error } = await supabase
                .from('saved_jobs')
                .delete()
                .eq('candidate_id', candidate_id)
                .eq('job_id', job_id)
                .select();

            if (error) {
                console.error('[unsaveJob] Delete error:', error);
                return res.status(500).json({ error: 'Failed to unsave job', details: error.message });
            }

            console.log(`Job unsaved successfully: ${candidate_id} -> ${job_id}`);

            res.status(200).json({
                message: 'Job unsaved successfully',
                deleted_record: data[0] // Return the deleted record for confirmation
            });

        } catch (err) {
            console.error('[unsaveJob] Internal error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    //[PUT] /updateJob/:jobId : Update a job
}

module.exports = new SaveJobController();
