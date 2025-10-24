import ApiClient from "./ApiClient";

class EmailApiService {
  /**
   * Send interview invitation email to candidate(s)
   * @param {string} companyId - ID of the company sending the email
   * @param {Object} emailData - Email details
   * @param {string|string[]} emailData.email - Single email or array of emails
   * @param {string} emailData.email_type - Type: 'formal', 'friendly', or 'online'
   * @param {string} emailData.email_date_time - Interview date and time (e.g., "25/09/2025 - 14:00")
   * @param {string} emailData.email_location - Interview location (optional for online)
   * @param {string} emailData.email_duration - Interview duration (e.g., "60 phút")
   * @returns {Promise<Object>} Response with success/failure details
   */
  static async sendInterviewInvitation(companyId, emailData) {
    try {
      console.log("[EmailApiService] Sending interview invitation:", {
        companyId,
        emailData,
      });

      const response = await ApiClient.post(
        `/email/send-email/${companyId}`,
        emailData
      );

      console.log("[EmailApiService] Email sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("[EmailApiService] Send email error:", error);
      throw error;
    }
  }

  /**
   * Send bulk interview invitations to multiple candidates
   * @param {string} companyId - ID of the company sending the email
   * @param {Object} emailData - Email details (same as sendInterviewInvitation but with emails array)
   * @returns {Promise<Object>} Response with success/failure details for each email
   */
  static async sendBulkInterviewInvitations(companyId, emailData) {
    try {
      console.log("[EmailApiService] Sending bulk interview invitations:", {
        companyId,
        emailsCount: emailData.emails?.length || 0,
      });

      const response = await ApiClient.post(
        `/email/send-bulk-email/${companyId}`,
        emailData
      );

      console.log(
        "[EmailApiService] Bulk emails sent successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("[EmailApiService] Send bulk email error:", error);
      throw error;
    }
  }
}

export default EmailApiService;
