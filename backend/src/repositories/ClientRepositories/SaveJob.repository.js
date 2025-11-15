const supabase = require('../../supabase/config');

class SaveJobRepository {
    /**
     * Get saved jobs by candidate with details
     */
    async getSavedJobsByCandidate(candidate_id) {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select(`
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
            `)
            .eq('candidate_id', candidate_id)
            .order('saved_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get saved job details
     */
    async getSavedJobDetails(candidate_id, job_id) {
        // Check if job is saved
        const { data: savedJob, error: savedJobError } = await supabase
            .from('saved_jobs')
            .select('*')
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .single();

        if (savedJobError) {
            throw savedJobError;
        }

        // Get job details
        const { data: jobDetails, error: jobError } = await supabase
            .from('jobs')
            .select(`
                *,
                employers!jobs_employer_id_fkey (
                    company_name,
                    company_logo,
                    company_website,
                    company_address,
                    industry,
                    contact_person
                )
            `)
            .eq('id', job_id)
            .single();

        if (jobError) {
            throw jobError;
        }

        return {
            ...savedJob,
            job_details: jobDetails,
        };
    }

    /**
     * Check if job is already saved
     */
    async checkJobSaved(candidate_id, job_id) {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    /**
     * Save job
     */
    async saveJob(candidate_id, job_id) {
        const { data, error } = await supabase
            .from('saved_jobs')
            .upsert([
                { candidate_id, job_id, saved_at: new Date().toISOString() }
            ])
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Unsave job
     */
    async unsaveJob(candidate_id, job_id) {
        const { data, error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .select();

        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new SaveJobRepository();
