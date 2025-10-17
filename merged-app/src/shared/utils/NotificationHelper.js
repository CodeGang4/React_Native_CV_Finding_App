/**
 * Notification Helper Utilities
 * Helper functions to create different types of notifications easily
 */
import notificationApiService from '../services/api/NotificationApiService';

class NotificationHelper {
    /**
     * Create application status notification
     * @param {string} candidateId - Candidate user ID
     * @param {string} employerId - Employer user ID (sender)
     * @param {string} status - Application status (applied, reviewing, accepted, rejected)
     * @param {string} jobTitle - Job title
     * @param {object} additionalData - Additional data
     */
    static async createApplicationStatusNotification(candidateId, employerId, status, jobTitle, additionalData = {}) {
        const statusMessages = {
            applied: `Ứng tuyển của bạn cho vị trí "${jobTitle}" đã được gửi thành công`,
            reviewing: `Hồ sơ ứng tuyển cho vị trí "${jobTitle}" đang được xem xét`,
            accepted: `Chúc mừng! Bạn đã được chấp nhận cho vị trí "${jobTitle}"`,
            rejected: `Rất tiếc, hồ sơ ứng tuyển cho vị trí "${jobTitle}" chưa phù hợp lúc này`
        };

        return await notificationApiService.createNotification({
            recipient_id: candidateId,
            recipient_type: 'candidate',
            sender_id: employerId,
            sender_type: 'employer',
            title: `Cập nhật trạng thái ứng tuyển`,
            message: statusMessages[status] || `Trạng thái ứng tuyển cho "${jobTitle}" đã được cập nhật`,
            type: 'application_status',
            data: {
                application_status: status,
                job_title: jobTitle,
                ...additionalData
            }
        });
    }

    /**
     * Create interview schedule notification
     * @param {string} candidateId - Candidate user ID
     * @param {string} employerId - Employer user ID (sender)
     * @param {string} jobTitle - Job title
     * @param {string} interviewDate - Interview date/time
     * @param {object} additionalData - Additional data
     */
    static async createInterviewScheduleNotification(candidateId, employerId, jobTitle, interviewDate, additionalData = {}) {
        return await notificationApiService.createNotification({
            recipient_id: candidateId,
            recipient_type: 'candidate',
            sender_id: employerId,
            sender_type: 'employer',
            title: `Lịch phỏng vấn mới`,
            message: `Bạn có lịch phỏng vấn cho vị trí "${jobTitle}" vào ${interviewDate}`,
            type: 'interview_schedule',
            data: {
                job_title: jobTitle,
                interview_date: interviewDate,
                ...additionalData
            }
        });
    }

    /**
     * Create new job posted notification
     * @param {string} candidateId - Candidate user ID
     * @param {string} employerId - Employer user ID (sender)
     * @param {string} jobTitle - Job title
     * @param {string} companyName - Company name
     * @param {object} additionalData - Additional data
     */
    static async createJobPostedNotification(candidateId, employerId, jobTitle, companyName, additionalData = {}) {
        return await notificationApiService.createNotification({
            recipient_id: candidateId,
            recipient_type: 'candidate',
            sender_id: employerId,
            sender_type: 'employer',
            title: `Công việc mới phù hợp`,
            message: `${companyName} vừa đăng tuyển vị trí "${jobTitle}" có thể phù hợp với bạn`,
            type: 'job_posted',
            data: {
                job_title: jobTitle,
                company_name: companyName,
                ...additionalData
            }
        });
    }

    /**
     * Create profile update notification
     * @param {string} userId - User ID
     * @param {string} userType - User type (candidate/employer)
     * @param {string} updateType - Type of update
     * @param {object} additionalData - Additional data
     */
    static async createProfileUpdateNotification(userId, userType, updateType, additionalData = {}) {
        const updateMessages = {
            profile_completed: 'Hồ sơ của bạn đã được hoàn thiện',
            profile_verified: 'Hồ sơ của bạn đã được xác thực thành công',
            skills_updated: 'Kỹ năng của bạn đã được cập nhật',
            experience_added: 'Kinh nghiệm làm việc mới đã được thêm vào hồ sơ'
        };

        return await notificationApiService.createNotification({
            recipient_id: userId,
            recipient_type: userType,
            sender_type: 'system',
            title: `Cập nhật hồ sơ`,
            message: updateMessages[updateType] || 'Hồ sơ của bạn đã được cập nhật',
            type: 'profile_update',
            data: {
                update_type: updateType,
                ...additionalData
            }
        });
    }

    /**
     * Create system announcement
     * @param {string} recipientType - 'candidate', 'employer', 'admin', or 'all'
     * @param {string} title - Announcement title
     * @param {string} message - Announcement message
     * @param {object} additionalData - Additional data
     */
    static async createSystemAnnouncement(recipientType, title, message, additionalData = {}) {
        return await notificationApiService.sendSystemNotification({
            recipient_type: recipientType,
            title,
            message,
            type: 'system_announcement',
            data: additionalData
        });
    }

    /**
     * Create account verification notification
     * @param {string} userId - User ID
     * @param {string} userType - User type (candidate/employer)
     * @param {string} verificationType - Type of verification
     * @param {object} additionalData - Additional data
     */
    static async createAccountVerificationNotification(userId, userType, verificationType, additionalData = {}) {
        const verificationMessages = {
            email_verified: 'Email của bạn đã được xác thực thành công',
            phone_verified: 'Số điện thoại của bạn đã được xác thực',
            identity_verified: 'Danh tính của bạn đã được xác thực',
            company_verified: 'Công ty của bạn đã được xác thực'
        };

        return await notificationApiService.createNotification({
            recipient_id: userId,
            recipient_type: userType,
            sender_type: 'system',
            title: `Xác thực tài khoản`,
            message: verificationMessages[verificationType] || 'Tài khoản của bạn đã được xác thực',
            type: 'account_verification',
            data: {
                verification_type: verificationType,
                ...additionalData
            }
        });
    }

    /**
     * Batch create notifications for multiple users
     * @param {Array} notifications - Array of notification objects
     */
    static async batchCreateNotifications(notifications) {
        const promises = notifications.map(notification => 
            notificationApiService.createNotification(notification)
        );
        
        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Batch notifications: ${successful.length} successful, ${failed.length} failed`);
            
            return {
                successful: successful.length,
                failed: failed.length,
                results
            };
        } catch (error) {
            console.error('Error in batch notification creation:', error);
            throw error;
        }
    }
}

export default NotificationHelper;