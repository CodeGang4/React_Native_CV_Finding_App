const supabase = require('../../supabase/config');

class ApplicationRepository {
    /**
     * Check if application exists
     */
    async checkApplicationExists(candidate_id, job_id) {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('candidate_id', candidate_id)
            .eq('job_id', job_id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data;
    }

    /**
     * Get candidate data by ID
     */
    async getCandidateById(candidate_id) {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', candidate_id)
            .single();
        
        if (error) {
            throw error;
        }
        
        return data;
    }

    /**
     * Get job data by ID
     */
    async getJobById(job_id) {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', job_id)
            .single();
        
        if (error) {
            throw error;
        }
        
        return data;
    }

    /**
     * Create new application
     */
    async createApplication(applicationData) {
        const { data, error } = await supabase
            .from('applications')
            .insert(applicationData)
            .select();
        
        if (error) {
            throw error;
        }
        
        return data[0];
    }

    /**
     * Get applications by candidate
     */
    async getApplicationsByCandidate(candidate_id) {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('candidate_id', candidate_id);
        
        if (error) {
            throw error;
        }
        
        return data || [];
    }

    /**
     * Get all candidates for a job
     */
    async getCandidatesByJob(job_id) {
        const { data, error } = await supabase
            .from('applications')
            .select('candidates(*),applied_at,status')
            .eq('job_id', job_id);
        
        if (error) {
            throw error;
        }
        
        return data || [];
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(application_id, status) {
        const { data, error } = await supabase
            .from('applications')
            .update({ 
                status, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', application_id)
            .select();
        
        if (error) {
            throw error;
        }
        
        return data[0];
    }

    /**
     * Get applications by status for a job
     */
    async getApplicationsByStatusAndJob(job_id, status) {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', job_id)
            .eq('status', status);
        
        if (error) {
            throw error;
        }
        
        return data || [];
    }

    /**
     * Get application count by job
     */
    async getApplicationCountByJob(job_id) {
        const { data, error } = await supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .eq('job_id', job_id);
        
        if (error) {
            throw error;
        }
        
        return data ? data.length : 0;
    }
}

module.exports = new ApplicationRepository();
