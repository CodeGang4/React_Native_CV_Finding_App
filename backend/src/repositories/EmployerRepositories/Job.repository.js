const supabase = require("../../supabase/config");


class JobRepository {
    async getJob() {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .order('created_at', { ascending: false });
            return { data, error };
        } catch (error) {
            console.error('JobRepository.getJob error:', error);
            return { data: null, error };
        }
    }


    async getJobByCompanyId(companyId) {
        try {
            const { data: jobsFromDB, error } = await supabase
                .from("jobs")
                .select("id")
                .eq("employer_id", companyId)
                .order("created_at", { ascending: false });
            return { data: jobsFromDB, error };
        } catch (error) {
            console.error('JobRepository.getJobByCompanyId error:', error);
            return { data: null, error };
        }
    }

    async getJobDetails(jobId) {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", jobId)
                .single();
            return { data, error };
        } catch (error) {
            console.error('JobRepository.getJobDetails error:', error);
            return { data: null, error };
        }
    }

    async addJob(JobData) {
        try {
            const {data,error}  =await supabase.from("jobs").insert(JobData).select();
            return {data,error};
        } catch (error) {
            console.error('JobRepository.addJob error:', error);
            return { data: null, error };
        }
    }

    async deleteJob(jobId) {
        try {
            const {data,error} = await supabase.from("jobs").delete().eq("id",jobId).select().single();
            return {data,error};
        } catch (error) {
            console.error('JobRepository.deleteJob error:', error);
            return { data: null, error };
        }
    }

    async updateJob(jobId, updateData) {
        try {
            const {data,error} = await supabase.from("jobs").update(updateData).eq("id",jobId).select().single();
            return {data,error};
        } catch (error) {
            console.error('JobRepository.updateJob error:', error);
            return { data: null, error };
        }
    }

    async incrementJobViews(jobId) {
        try {
            const { data, error } = await supabase.rpc("increment_views_atomic", {
                job_uuid: jobId,
            });
            return { data, error };
        } catch (error) {
            console.error('JobRepository.incrementJobViews error:', error);
            return { data: null, error };
        }
    }

    async getTopViewedJobs(number) {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select()
                .order("views", { ascending: false })
                .limit(number);
            return { data, error };
        } catch (error) {
            console.error('JobRepository.getTopViewedJobs error:', error);
            return { data: null, error };
        }
    }

    async hideJob(jobId,candidate_id) {
        try {
            const { data, error } = await supabase
                .from("hidden_jobs")
                .upsert({
                    candidate_id: candidate_id,
                    job_id: jobId,
                    reason: "swipe_delete",
                    hidden_at: new Date().toISOString(),
                })
                .select();
            return { data, error };

        } catch (error) {
            console.error('JobRepository.hideJob error:', error);
            return { data: null, error };
        }
    }

    async getHiddenJob(candidate_id) {
        try {
            const { data, error } = await supabase
                .from("hidden_jobs")
                .select("*")
                .eq("candidate_id", candidate_id)
                .order("hidden_at", { ascending: false });
            return { data, error };
        } catch (error) {
            console.error('JobRepository.getHiddenJob error:', error);
            return { data: null, error };
        }
    }

    async checkMultipleJobTitles(JobTitles) {
        try{
            const {data,error} = await supabase.from("jobs").select("*").in("title",JobTitles);
            return {data,error};
        }catch (error) {
            console.error('JobRepository.checkMultipleJobContents error:', error);
            return { data: null, error };
        }
    }

    async checkJobExists(JobTitle) {
        try {
            const {data,error} = await supabase.from("jobs").select("*").eq("title",JobTitle).maybeSingle();
            return {
                exists: data !== null,
                data,
                error
            };
        } catch (error) {
            console.error('JobRepository.checkJobExists error:', error);
            return { exists: false, data: null, error };
        }
    }


}

module.exports  = new JobRepository();