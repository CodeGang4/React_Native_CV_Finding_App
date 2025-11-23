/**
 * Auto Notification Service
 * Universal service to automatically send notifications based on action types
 * Usage: Just call after any action (addJob, applyJob, etc.) - no manual triggers needed
 */
import notificationApiService from './api/NotificationApiService';

class AutoNotificationService {
    /**
     * Auto send notification after job is posted
     * @param {object} jobData - Job data
     * @param {string} employerId - Employer ID who posted the job
     */
    async notifyJobPosted(jobData, employerId) {
        try {
            console.log('[AutoNotify] Job Posted:', jobData.title);

            // Gửi cho TẤT CẢ candidates
            await notificationApiService.sendSystemNotification({
                recipient_type: 'candidate',
                title: `Việc làm mới: ${jobData.title}`,
                message: `${jobData.company || 'Công ty'} đang tuyển ${jobData.title}. Mức lương: ${jobData.salary || 'Thỏa thuận'}. Địa điểm: ${jobData.location || 'Chưa cập nhật'}.`,
                type: 'job_alert',
                data: {
                    jobId: jobData.id,
                    jobTitle: jobData.title,
                    employerId: employerId,
                    action: 'view_job_detail'
                }
            });

            // Xác nhận cho employer
            await notificationApiService.createNotification({
                recipient_id: employerId,
                recipient_type: 'employer',
                title: ' Tin tuyển dụng đã đăng',
                message: `"${jobData.title}" đã được đăng và gửi đến tất cả ứng viên phù hợp.`,
                type: 'job_posted',
                sender_type: 'system',
                data: { jobId: jobData.id }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Job Posted notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Job Posted failed:', error);
        }
    }

    /**
     * Auto send notification after candidate applies to job
     * @param {object} applicationData - { candidateId, candidateName, employerId, jobId, jobTitle, applicationId }
     */
    async notifyJobApplication(applicationData) {
        try {
            console.log(' [AutoNotify] Job Application:', applicationData.jobTitle);

            // Gửi cho EMPLOYER
            await notificationApiService.createNotification({
                recipient_id: applicationData.employerId,
                recipient_type: 'employer',
                title: ' Ứng viên mới ứng tuyển',
                message: `${applicationData.candidateName || 'Một ứng viên'} vừa ứng tuyển vào vị trí ${applicationData.jobTitle}`,
                type: 'application_received',
                sender_id: applicationData.candidateId,
                sender_type: 'candidate',
                data: {
                    applicationId: applicationData.applicationId,
                    candidateId: applicationData.candidateId,
                    jobId: applicationData.jobId,
                    action: 'view_application'
                }
            });

            // Xác nhận cho CANDIDATE
            await notificationApiService.createNotification({
                recipient_id: applicationData.candidateId,
                recipient_type: 'candidate',
                title: ' Đã gửi hồ sơ ứng tuyển',
                message: `Hồ sơ của bạn cho vị trí "${applicationData.jobTitle}" đã được gửi thành công.`,
                type: 'application_sent',
                sender_type: 'system',
                data: {
                    applicationId: applicationData.applicationId,
                    jobId: applicationData.jobId,
                    action: 'view_my_application'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Application notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Application failed:', error);
        }
    }

    /**
     * Auto send notification when job is saved/bookmarked
     * @param {object} data - { candidateId, candidateName, employerId, jobId, jobTitle }
     */
    async notifyJobSaved(data) {
        try {
            console.log(' [AutoNotify] Job Saved:', data.jobTitle);

            // Gửi cho EMPLOYER (để employer biết job của họ được quan tâm)
            await notificationApiService.createNotification({
                recipient_id: data.employerId,
                recipient_type: 'employer',
                title: '⭐ Có ứng viên quan tâm',
                message: `Tin "${data.jobTitle}" đã được ${data.candidateName || 'một ứng viên'} lưu lại.`,
                type: 'job_saved',
                sender_id: data.candidateId,
                sender_type: 'candidate',
                data: {
                    jobId: data.jobId,
                    candidateId: data.candidateId,
                    action: 'view_job_stats'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Job Saved notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Job Saved failed:', error);
        }
    }

    /**
     * Auto send notification when application status changes
     * @param {object} data - { candidateId, candidateName, applicationId, jobTitle, status, employerId }
     * @param {string} status - 'accepted', 'rejected', 'reviewing', 'interview'
     */
    async notifyApplicationStatus(data, status) {
        try {
            console.log(' [AutoNotify] Application Status:', status);

            const statusMessages = {
                accepted: {
                    title: ' Hồ sơ được chấp nhận',
                    message: `Chúc mừng! Hồ sơ của bạn cho vị trí "${data.jobTitle}" đã được chấp nhận.`
                },
                rejected: {
                    title: ' Hồ sơ chưa phù hợp',
                    message: `Rất tiếc, hồ sơ của bạn cho vị trí "${data.jobTitle}" chưa phù hợp lúc này.`
                },
                reviewing: {
                    title: '👀 Đang xem xét hồ sơ',
                    message: `Nhà tuyển dụng đang xem xét hồ sơ của bạn cho vị trí "${data.jobTitle}".`
                },
                interview: {
                    title: '📅 Mời phỏng vấn',
                    message: `Bạn đã được mời phỏng vấn cho vị trí "${data.jobTitle}". Hãy kiểm tra chi tiết!`
                }
            };

            const statusInfo = statusMessages[status] || {
                title: 'Cập nhật hồ sơ',
                message: `Có cập nhật về hồ sơ ứng tuyển "${data.jobTitle}".`
            };

            // Gửi cho CANDIDATE
            await notificationApiService.createNotification({
                recipient_id: data.candidateId,
                recipient_type: 'candidate',
                title: statusInfo.title,
                message: statusInfo.message,
                type: 'application_status',
                sender_id: data.employerId,
                sender_type: 'employer',
                data: {
                    applicationId: data.applicationId,
                    jobTitle: data.jobTitle,
                    status: status,
                    action: 'view_application_detail'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Application Status notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Application Status failed:', error);
        }
    }

    /**
     * Auto send notification when employer views candidate profile
     * @param {object} data - { candidateId, candidateName, employerId, employerName, jobId, jobTitle }
     */
    async notifyProfileViewed(data) {
        try {
            console.log(' [AutoNotify] Profile Viewed:', data.candidateName);

            // Gửi cho CANDIDATE
            await notificationApiService.createNotification({
                recipient_id: data.candidateId,
                recipient_type: 'candidate',
                title: '👁️ Hồ sơ được xem',
                message: `${data.employerName || 'Một nhà tuyển dụng'} đã xem hồ sơ của bạn${data.jobTitle ? ` cho vị trí ${data.jobTitle}` : ''}.`,
                type: 'profile_viewed',
                sender_id: data.employerId,
                sender_type: 'employer',
                data: {
                    employerId: data.employerId,
                    jobId: data.jobId,
                    action: 'view_employer_profile'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Profile Viewed notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Profile Viewed failed:', error);
        }
    }

    /**
     * Auto send notification when job is about to expire
     * @param {object} jobData - { jobId, jobTitle, employerId, daysLeft }
     */
    async notifyJobExpiring(jobData) {
        try {
            console.log(' [AutoNotify] Job Expiring:', jobData.jobTitle);

            // Gửi cho EMPLOYER
            await notificationApiService.createNotification({
                recipient_id: jobData.employerId,
                recipient_type: 'employer',
                title: ' Tin tuyển dụng sắp hết hạn',
                message: `Tin "${jobData.jobTitle}" sẽ hết hạn trong ${jobData.daysLeft} ngày. Gia hạn ngay để tiếp tục nhận ứng viên!`,
                type: 'job_expiring',
                sender_type: 'system',
                data: {
                    jobId: jobData.jobId,
                    daysLeft: jobData.daysLeft,
                    action: 'renew_job'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Job Expiring notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Job Expiring failed:', error);
        }
    }

    /**
     * Auto send welcome notification for new users
     * @param {string} userId - User ID
     * @param {string} userType - 'candidate' or 'employer'
     * @param {string} userName - User name
     */
    async notifyWelcome(userId, userType, userName) {
        try {
            console.log(' [AutoNotify] Welcome:', userName);

            const messages = {
                candidate: {
                    title: 'Chào mừng đến với JobFinder!',
                    message: `Xin chào ${userName}! Hãy hoàn thiện hồ sơ và bắt đầu tìm kiếm công việc phù hợp ngay hôm nay.`
                },
                employer: {
                    title: 'Chào mừng Nhà tuyển dụng!',
                    message: `Xin chào ${userName}! Bắt đầu đăng tin tuyển dụng để tìm kiếm ứng viên tài năng.`
                }
            };

            const msgInfo = messages[userType] || messages.candidate;

            await notificationApiService.createNotification({
                recipient_id: userId,
                recipient_type: userType,
                title: msgInfo.title,
                message: msgInfo.message,
                type: 'welcome',
                sender_type: 'system',
                data: {
                    action: 'complete_profile'
                }
            });

            this._triggerRefresh();
            console.log(' [AutoNotify] Welcome notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Welcome failed:', error);
        }
    }

    /**
     * Generic notification sender - use for custom scenarios
     * @param {object} data - { recipient_id, recipient_type, title, message, type, sender_id, sender_type, data }
     */
    async sendNotification(data) {
        try {
            console.log(' [AutoNotify] Generic:', data.title);

            if (data.recipient_type === 'all_candidates' || data.recipient_type === 'all_employers') {
                // Broadcast to all users of type
                await notificationApiService.sendSystemNotification({
                    recipient_type: data.recipient_type.replace('all_', ''),
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    data: data.data || {}
                });
            } else {
                // Send to specific user
                await notificationApiService.createNotification(data);
            }

            this._triggerRefresh();
            console.log(' [AutoNotify] Generic notification sent');
        } catch (error) {
            console.error(' [AutoNotify] Generic failed:', error);
        }
    }

    /**
     * Trigger global refresh for all active users
     * @private
     */
    _triggerRefresh() {
        if (global.refreshNotifications) {
            global.refreshNotifications();
        }
    }
}

// Export singleton instance
export default new AutoNotificationService();
