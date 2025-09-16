const supabase = require('../../supabase/config');
const redis = require('../../redis/config');


class SaveJobController {

    //[GET] /getJobs : Get all jobs
    async getJobsByCandidates(req, res) {
        const candidate_id = req.params.candidate_id;
        if (!candidate_id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }
        const { data, error } = await supabase
            .from('saved_jobs')
            .select()
            .eq('candidate_id', candidate_id);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        // Redis log
        try {
            await redis.setEx(`log:getJobsByCandidates:${candidate_id}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'getJobsByCandidates', candidate_id, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (getJobsByCandidates):', err);
        }
        res.status(200).json(data);
    }

    async getSavedJobsDetails(req, res) {
        const candidate_id = req.params.candidate_id;
        const job_id = req.params.job_id;

        if (!candidate_id) {
            return res.status(400).json({ error: "Candidate ID is required" });
        }
        if (!job_id) {
            return res.status(400).json({ error: "Job ID is required" });
        }

        try {
            const cacheKey = `savedJobs:${candidate_id}:${job_id}`;

            // 1. Check Redis cache
            const cacheStart = Date.now();
            const cachedData = await redis.get(cacheKey);
            const cacheGetTime = Date.now() - cacheStart;

            if (cachedData) {
                console.log(
                    `[getSavedJobsDetails] ✅ Cache HIT | candidate=${candidate_id}, job=${job_id} | Redis GET=${cacheGetTime} ms`
                );
                return res.status(200).json(JSON.parse(cachedData));
            }
            console.log(
                `[getSavedJobsDetails] ❌ Cache MISS | candidate=${candidate_id}, job=${job_id} | Redis GET=${cacheGetTime} ms`
            );

            // 2. Query Supabase nếu chưa có cache
            const dbStart = Date.now();
            const { data, error } = await supabase
                .from("saved_jobs")
                .select()
                .eq("candidate_id", candidate_id)
                .eq("job_id", job_id);
            const dbQueryTime = Date.now() - dbStart;
            console.log(`[getSavedJobsDetails] Supabase query time: ${dbQueryTime} ms`);

            if (error) {
                console.error("[getSavedJobsDetails] Supabase error:", error.message);
                return res.status(400).json({ error: error.message });
            }

            // 3. Save to Redis (TTL: 24h)
            const cacheSetStart = Date.now();
            await redis.setEx(cacheKey, 60 * 60 * 24, JSON.stringify(data));
            const cacheSetTime = Date.now() - cacheSetStart;
            console.log(`[getSavedJobsDetails] Redis setEx time: ${cacheSetTime} ms`);

            // 4. Redis log (async, không chặn response)
            setImmediate(() => {
                redis.setEx(
                    `log:getSavedJobsDetails:${candidate_id}:${job_id}:${Date.now()}`,
                    60 * 60 * 24,
                    JSON.stringify({
                        action: "getSavedJobsDetails",
                        candidate_id,
                        job_id,
                        time: new Date().toISOString(),
                    })
                ).catch(err =>
                    console.error("Redis log error (getSavedJobsDetails):", err)
                );
            });

            return res.status(200).json(data);
        } catch (err) {
            console.error("[getSavedJobsDetails] Internal error:", err);
            return res.status(500).json({ error: "Internal server error" });
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

        const { data, error } = await supabase.from('saved_jobs')
            .upsert([{ candidate_id, job_id, saved_at: new Date().toISOString() }])
            .select();

        if (error) {
            console.error({ error });
            return res.status(400).json({ error: error.message });
        }
        // Redis log
        try {
            await redis.setEx(`log:saveJob:${candidate_id}:${job_id}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'saveJob', candidate_id, job_id, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (saveJob):', err);
        }
        res.status(200).json(data);
    }

    //[DELETE] /deleteJob/:jobId : Delete a job
    async UnSavedJob(req, res) {
        const candidate_id = req.params.candidate_id;
        const job_id = req.body.job_id;

        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        if (!candidate_id) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }

        const { data, error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Saved job not found or not deleted' });
        }
        // Redis log
        try {
            await redis.setEx(`log:unsaveJob:${candidate_id}:${job_id}:${Date.now()}`, 60 * 60 * 24, JSON.stringify({ action: 'unsaveJob', candidate_id, job_id, time: new Date().toISOString() }));
        } catch (err) {
            console.error('Redis log error (unsaveJob):', err);
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    }

    //[PUT] /updateJob/:jobId : Update a job

}

module.exports = new SaveJobController();


