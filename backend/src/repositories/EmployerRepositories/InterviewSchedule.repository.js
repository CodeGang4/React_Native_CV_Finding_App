const supabase = require('../../supabase/config');

class InterviewScheduleRepository {
    /**
     * Create interview schedule
     */
    static async createInterviewSchedule(scheduleData) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .insert(scheduleData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in createInterviewSchedule:', error);
            throw error;
        }
    }

    /**
     * Get candidate email and info
     */
    static async getCandidateInfo(candidateId) {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .select(`
                    user_id,
                    full_name,
                    users!inner(email)
                `)
                .eq('user_id', candidateId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getCandidateInfo:', error);
            throw error;
        }
    }

    /**
     * Get employer info
     */
    static async getEmployerInfo(employerId) {
        try {
            const { data, error } = await supabase
                .from('employers')
                .select('company_name, company_logo, industry, contact_person')
                .eq('user_id', employerId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getEmployerInfo:', error);
            throw error;
        }
    }

    /**
     * Get job info
     */
    static async getJobInfo(jobId) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('id, title, position_level, description, salary_range')
                .eq('id', jobId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getJobInfo:', error);
            throw error;
        }
    }

    /**
     * Get interview schedules by company
     */
    static async getSchedulesByCompany(employerId) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select('*')
                .eq('employer_id', employerId)
                .order('interview_datetime', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getSchedulesByCompany:', error);
            throw error;
        }
    }

    /**
     * Get interview schedule by ID with relations
     */
    static async getScheduleById(scheduleId) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select(`
                    *,
                    candidates(full_name, users(email)),
                    jobs(title, position),
                    employers(company_name, company_logo)
                `)
                .eq('id', scheduleId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getScheduleById:', error);
            throw error;
        }
    }

    /**
     * Update interview schedule
     */
    static async updateSchedule(scheduleId, updateData) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', scheduleId)
                .select(`
                    *,
                    candidates(full_name, users(email)),
                    jobs(title),
                    employers(company_name)
                `)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in updateSchedule:', error);
            throw error;
        }
    }

    /**
     * Update schedule status
     */
    static async updateScheduleStatus(scheduleId, status) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', scheduleId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in updateScheduleStatus:', error);
            throw error;
        }
    }

    /**
     * Get schedules by status
     */
    static async getSchedulesByStatus(employerId, status) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select('*')
                .eq('employer_id', employerId)
                .eq('status', status)
                .order('interview_datetime', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getSchedulesByStatus:', error);
            throw error;
        }
    }

    /**
     * Get schedules by candidate
     */
    static async getSchedulesByCandidate(candidateId) {
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select(`
                    *,
                    jobs(title, position_level),
                    employers(company_name, company_logo)
                `)
                .eq('candidate_id', candidateId)
                .order('interview_datetime', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getSchedulesByCandidate:', error);
            throw error;
        }
    }

    /**
     * Delete schedule
     */
    static async deleteSchedule(scheduleId) {
        try {
            const { error } = await supabase
                .from('interview_schedules')
                .delete()
                .eq('id', scheduleId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error in deleteSchedule:', error);
            throw error;
        }
    }
}

module.exports = InterviewScheduleRepository;
