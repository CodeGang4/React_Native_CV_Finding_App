const InterviewScheduleRepository = require('../../repositories/EmployerRepositories/InterviewSchedule.repository');
const InterviewScheduleCache = require('../../cache/EmployerCache/InterviewSchedule.cache');
const { AppError } = require('../../utils/errorHandler');
const sendEmailService = require('../sendEmailService');

class InterviewScheduleService {
    /**
     * Validate and convert datetime format
     */
    static validateDateTime(interview_datetime) {
        try {
            let validDateTime;

            if (interview_datetime.includes('T') || interview_datetime.match(/^\d{4}-\d{2}-\d{2}/)) {
                validDateTime = new Date(interview_datetime).toISOString();
            } else if (interview_datetime.includes('/') && interview_datetime.includes(' - ')) {
                const [datePart, timePart] = interview_datetime.split(' - ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute] = timePart.split(':');
                const date = new Date(year, month - 1, day, hour, minute);
                validDateTime = date.toISOString();
            } else {
                validDateTime = new Date(interview_datetime).toISOString();
            }

            if (isNaN(Date.parse(validDateTime))) {
                throw new Error('Invalid date format');
            }

            return validDateTime;
        } catch (error) {
            throw new AppError(
                'Invalid interview_datetime format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) or dd/mm/yyyy - hh:mm',
                400
            );
        }
    }

    /**
     * Create interview schedule with optional email
     */
    static async createInterviewSchedule(scheduleData) {
        const {
            candidate_id,
            job_id,
            employer_id,
            interview_datetime,
            location,
            duration,
            email_type = 'formal',
            send_email = true
        } = scheduleData;

        // Validate required fields
        if (!candidate_id || !job_id || !employer_id || !interview_datetime || !location || !duration) {
            throw new AppError('Missing required fields', 400);
        }

        // Validate datetime
        const validDateTime = this.validateDateTime(interview_datetime);

        // Create schedule
        const schedule = await InterviewScheduleRepository.createInterviewSchedule({
            candidate_id,
            job_id,
            employer_id,
            interview_datetime: validDateTime,
            location,
            duration
        });

        console.log('Interview schedule created:', schedule);

        // Send email if requested
        let emailResult = null;
        if (send_email) {
            try {
                const [candidateData, employerData] = await Promise.all([
                    InterviewScheduleRepository.getCandidateInfo(candidate_id),
                    InterviewScheduleRepository.getEmployerInfo(employer_id)
                ]);

                if (candidateData?.users?.email && employerData?.company_name) {
                    const interviewDate = new Date(validDateTime);
                    const formattedDateTime = interviewDate.toLocaleString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    emailResult = await sendEmailService(
                        candidateData.users.email,
                        email_type,
                        formattedDateTime,
                        location,
                        employerData.company_name,
                        duration,
                        employer_id
                    );

                    console.log('Email sent result:', emailResult);
                }
            } catch (emailError) {
                console.error('Error in email process:', emailError);
                emailResult = { success: false, error: emailError.message };
            }
        }

        // Invalidate cache
        await InterviewScheduleCache.invalidateScheduleCache(employer_id, candidate_id);

        return {
            schedule,
            email: emailResult ? {
                sent: emailResult.success || false,
                messageId: emailResult.messageId,
                subject: emailResult.subject,
                error: emailResult.error
            } : { sent: false, reason: 'Email sending disabled' }
        };
    }

    /**
     * Get schedules by company
     */
    static async getSchedulesByCompany(employerId) {
        // Try cache first
        const cached = await InterviewScheduleCache.getCachedCompanySchedules(employerId);
        if (cached) {
            return cached;
        }

        // Get from database
        const schedules = await InterviewScheduleRepository.getSchedulesByCompany(employerId);

        // Cache result
        await InterviewScheduleCache.cacheCompanySchedules(employerId, schedules);

        return schedules;
    }

    /**
     * Get schedule detail
     */
    static async getScheduleDetail(scheduleId) {
        // Try cache first
        const cached = await InterviewScheduleCache.getCachedSchedule(scheduleId);
        if (cached) {
            return cached;
        }

        // Get from database
        const schedule = await InterviewScheduleRepository.getScheduleById(scheduleId);

        if (!schedule) {
            throw new AppError('Schedule not found', 404);
        }

        // Cache result
        await InterviewScheduleCache.cacheSchedule(scheduleId, schedule);

        return schedule;
    }

    /**
     * Update interview schedule
     */
    static async updateSchedule(scheduleId, updateData) {
        const { interview_datetime, location, duration, send_notification_email = true, email_type = 'formal' } = updateData;

        // Validate datetime if provided
        const validDateTime = interview_datetime ? this.validateDateTime(interview_datetime) : undefined;

        const dataToUpdate = {};
        if (validDateTime) dataToUpdate.interview_datetime = validDateTime;
        if (location) dataToUpdate.location = location;
        if (duration) dataToUpdate.duration = duration;

        // Update schedule
        const updatedSchedule = await InterviewScheduleRepository.updateSchedule(scheduleId, dataToUpdate);

        // Send notification email if requested
        let emailResult = null;
        if (send_notification_email && updatedSchedule.candidates?.users?.email) {
            const emailData = {
                toEmail: updatedSchedule.candidates.users.email,
                candidateName: updatedSchedule.candidates.full_name,
                emailType: email_type,
                emailDateTime: new Date(validDateTime || updatedSchedule.interview_datetime).toLocaleString('vi-VN'),
                emailLocation: location || updatedSchedule.location,
                emailDuration: duration || updatedSchedule.duration,
                companyName: updatedSchedule.employers.company_name,
                jobTitle: updatedSchedule.jobs.title
            };

            try {
                emailResult = await sendEmailService(
                    emailData.toEmail,
                    emailData.emailType,
                    emailData.emailDateTime,
                    emailData.emailLocation,
                    emailData.companyName,
                    emailData.emailDuration,
                    updatedSchedule.employer_id
                );
            } catch (error) {
                console.error('Error sending update notification:', error);
            }
        }

        // Invalidate cache
        await InterviewScheduleCache.invalidateScheduleCache(
            updatedSchedule.employer_id,
            updatedSchedule.candidate_id,
            scheduleId
        );

        return {
            schedule: updatedSchedule,
            email: emailResult ? {
                sent: emailResult.success || true,
                type: 'update_notification',
                messageId: emailResult.messageId
            } : { sent: false, reason: 'Email notification disabled' }
        };
    }

    /**
     * Update schedule status
     */
    static async updateScheduleStatus(scheduleId, status) {
        const validStatuses = ['scheduled', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status value', 400);
        }

        const schedule = await InterviewScheduleRepository.updateScheduleStatus(scheduleId, status);

        if (!schedule) {
            throw new AppError('Schedule not found or not updated', 404);
        }

        // Invalidate cache
        await InterviewScheduleCache.invalidateScheduleCache(schedule.employer_id, schedule.candidate_id, scheduleId);

        return schedule;
    }

    /**
     * Get schedules by status
     */
    static async getSchedulesByStatus(employerId, status) {
        const validStatuses = ['scheduled', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status value', 400);
        }

        // Try cache first
        const cached = await InterviewScheduleCache.getCachedSchedulesByStatus(employerId, status);
        if (cached) {
            return cached;
        }

        // Get from database
        const schedules = await InterviewScheduleRepository.getSchedulesByStatus(employerId, status);

        if (!schedules || schedules.length === 0) {
            throw new AppError('No schedules found for the given status', 404);
        }

        // Cache result
        await InterviewScheduleCache.cacheSchedulesByStatus(employerId, status, schedules);

        return schedules;
    }

    /**
     * Get candidate schedules
     */
    static async getCandidateSchedules(candidateId) {
        // Try cache first
        const cached = await InterviewScheduleCache.getCachedCandidateSchedules(candidateId);
        if (cached) {
            return cached;
        }

        // Get from database
        const schedules = await InterviewScheduleRepository.getSchedulesByCandidate(candidateId);

        // Cache result
        await InterviewScheduleCache.cacheCandidateSchedules(candidateId, schedules);

        return schedules;
    }

    /**
     * Delete schedule
     */
    static async deleteSchedule(scheduleId) {
        const schedule = await InterviewScheduleRepository.getScheduleById(scheduleId);
        
        if (!schedule) {
            throw new AppError('Schedule not found', 404);
        }

        await InterviewScheduleRepository.deleteSchedule(scheduleId);

        // Invalidate cache
        await InterviewScheduleCache.invalidateScheduleCache(
            schedule.employer_id,
            schedule.candidate_id,
            scheduleId
        );

        return true;
    }
}

module.exports = InterviewScheduleService;
