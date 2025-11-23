/**
 * NotificationTriggerService
 * Handles triggering notifications for various user actions
 */
import notificationApiService from '../api/NotificationApiService';

class NotificationTriggerService {
    
    /**
     * Trigger notification when candidate saves a job
     * @param {string} candidateId - ID of the candidate who saved the job
     * @param {string} jobId - ID of the saved job
     * @param {object} jobData - Job details (title, company, etc.)
     * @param {string} employerId - ID of the job owner (employer)
     */
    async triggerJobSavedNotification(candidateId, jobId, jobData, employerId) {
        try {
            console.log(' NotificationTriggerService: START - Triggering job saved notification');
            console.log(' Input params:', {
                candidateId,
                jobId,
                employerId,
                jobTitle: jobData?.title,
                jobData: JSON.stringify(jobData, null, 2)
            });

            // Create notification for employer
            const notificationData = {
                recipient_id: employerId,
                recipient_type: 'employer',
                title: '🔖 Job được quan tâm',
                message: `Một ứng viên đã lưu công việc "${jobData?.title || 'Không xác định'}" của bạn`,
                type: 'other',
                data: {
                    action: 'job_saved',
                    job_id: jobId,
                    candidate_id: candidateId,
                    job_title: jobData?.title,
                    company_name: jobData?.company_name,
                    timestamp: new Date().toISOString()
                }
            };

            console.log('Notification data to send:', JSON.stringify(notificationData, null, 2));

            const response = await notificationApiService.createNotification(notificationData);
            
            console.log('📬 API Response:', JSON.stringify(response, null, 2));
            
            // Check if response indicates success
            if (response && !response.error && response.success !== false) {
                console.log(' NotificationTriggerService: Job saved notification created successfully');
                return response;
            } else {
                console.error(' NotificationTriggerService: Failed to create job saved notification:', response);
                console.warn(' Notification failed but app will continue normally');
                return null;
            }

        } catch (error) {
            console.error(' NotificationTriggerService: Error triggering job saved notification:', error);
            console.error(' Error details:', error.message, error.stack);
            return null;
        }
    }

    /**
     * Trigger notification when candidate applies for a job
     * @param {string} candidateId - ID of the candidate
     * @param {string} jobId - ID of the job
     * @param {object} jobData - Job details
     * @param {string} employerId - ID of the job owner
     * @param {object} candidateData - Candidate details
     */
    async triggerJobApplicationNotification(candidateId, jobId, jobData, employerId, candidateData) {
        try {
            console.log('NotificationTriggerService: Triggering job application notification');

            const notificationData = {
                recipient_id: employerId,
                recipient_type: 'employer',
                title: ' Đơn ứng tuyển mới',
                message: `${candidateData?.name || 'Một ứng viên'} đã ứng tuyển vào vị trí "${jobData?.title || 'Không xác định'}"`,
                type: 'application_status',
                data: {
                    action: 'job_application',
                    job_id: jobId,
                    candidate_id: candidateId,
                    job_title: jobData?.title,
                    candidate_name: candidateData?.name,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await notificationApiService.createNotification(notificationData);
            console.log('NotificationTriggerService: Job application notification response:', response);
            return response;

        } catch (error) {
            console.error('NotificationTriggerService: Error triggering job application notification:', error);
            return null;
        }
    }

    /**
     * Trigger notification when employer posts a new job
     * @param {string} employerId - ID of the employer
     * @param {string} jobId - ID of the new job
     * @param {object} jobData - Job details
     * @param {Array} targetCandidates - Array of candidate IDs who should receive this notification
     */
    async triggerNewJobNotification(employerId, jobId, jobData, targetCandidates = []) {
        try {
            console.log('NotificationTriggerService: Triggering new job notifications');

            const promises = targetCandidates.map(candidateId => {
                const notificationData = {
                    recipient_id: candidateId,
                    recipient_type: 'candidate',
                    title: 'Công việc mới phù hợp',
                    message: `Có công việc mới "${jobData?.title || 'Không xác định'}" có thể phù hợp với bạn`,
                    type: 'job_posted',
                    data: {
                        action: 'new_job',
                        job_id: jobId,
                        employer_id: employerId,
                        job_title: jobData?.title,
                        company_name: jobData?.company_name,
                        location: jobData?.location,
                        timestamp: new Date().toISOString()
                    }
                };

                return notificationApiService.createNotification(notificationData);
            });

            const results = await Promise.allSettled(promises);
            console.log('NotificationTriggerService: New job notifications sent:', results.length);
            return results;

        } catch (error) {
            console.error('NotificationTriggerService: Error triggering new job notifications:', error);
            return null;
        }
    }

    /**
     * Trigger notification when employer views candidate profile
     * @param {string} employerId - ID of the employer
     * @param {string} candidateId - ID of the candidate
     * @param {object} employerData - Employer details
     */
    async triggerProfileViewNotification(employerId, candidateId, employerData) {
        try {
            console.log('NotificationTriggerService: Triggering profile view notification');

            const notificationData = {
                recipient_id: candidateId,
                recipient_type: 'candidate',
                title: '👀 Hồ sơ được xem',
                message: `Nhà tuyển dụng từ ${employerData?.company_name || 'một công ty'} đã xem hồ sơ của bạn`,
                type: 'profile_update',
                data: {
                    action: 'profile_view',
                    employer_id: employerId,
                    company_name: employerData?.company_name,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await notificationApiService.createNotification(notificationData);
            console.log('NotificationTriggerService: Profile view notification response:', response);
            return response;

        } catch (error) {
            console.error('NotificationTriggerService: Error triggering profile view notification:', error);
            return null;
        }
    }

    /**
     * Trigger system notification
     * @param {string} userId - User ID
     * @param {string} userType - 'candidate' or 'employer'
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {object} data - Additional data
     */
    async triggerSystemNotification(userId, userType, title, message, data = {}) {
        try {
            // Validate required parameters
            if (!userId) {
                throw new Error('userId is required for system notification');
            }
            if (!userType) {
                throw new Error('userType is required for system notification');
            }
            
            // Ensure userType is valid
            const validTypes = ['candidate', 'employer'];
            const finalUserType = validTypes.includes(userType) ? userType : 'candidate';
            
            if (userType !== finalUserType) {
                console.warn(` Invalid userType: ${userType}, using 'candidate' instead`);
            }

            const notificationData = {
                recipient_id: userId,
                recipient_type: finalUserType,
                title: title || '📢 Thông báo hệ thống',
                message: message || 'Bạn có một thông báo mới',
                type: 'system_announcement',
                data: {
                    action: 'system',
                    ...data,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await notificationApiService.createNotification(notificationData);
            console.log('NotificationTriggerService: System notification response:', response);
            return response;

        } catch (error) {
            console.error('NotificationTriggerService: Error triggering system notification:', error);
            return null;
        }
    }

    /**
     * Trigger test notification for development
     * @param {string} userId - User ID
     * @param {string} userType - 'candidate' or 'employer'
     */
    async triggerTestNotification(userId, userType) {
        try {
            // Validate parameters
            if (!userId) {
                throw new Error('userId is required for test notification');
            }
            
            // Ensure userType is valid, default to 'candidate'
            const validTypes = ['candidate', 'employer'];
            const finalUserType = validTypes.includes(userType) ? userType : 'candidate';
            
            if (!userType || userType !== finalUserType) {
                console.warn(` Invalid or missing userType: ${userType}, using 'candidate'`);
            }

            const testMessages = {
                candidate: {
                    title: ' Test thông báo ứng viên',
                    message: 'Đây là thông báo test cho ứng viên. Hệ thống hoạt động bình thường!'
                },
                employer: {
                    title: '🏢 Test thông báo nhà tuyển dụng',
                    message: 'Đây là thông báo test cho nhà tuyển dụng. Hệ thống hoạt động bình thường!'
                }
            };

            const { title, message } = testMessages[finalUserType] || testMessages.candidate;

            return await this.triggerSystemNotification(userId, finalUserType, title, message, {
                test: true,
                environment: 'development'
            });

        } catch (error) {
            console.error('NotificationTriggerService: Error triggering test notification:', error);
            return null;
        }
    }
}

// Export singleton instance
const notificationTriggerService = new NotificationTriggerService();
export default notificationTriggerService;