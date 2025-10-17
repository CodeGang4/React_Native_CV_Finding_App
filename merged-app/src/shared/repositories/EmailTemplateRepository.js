import BaseRepository from "./BaseRepository";
import apiClient from "../services/api/ApiClient.js";

class EmailTemplateRepository extends BaseRepository {
  constructor() {
    super(apiClient);
    this.baseEndpoint = "/email-template";
  }

  // Get all templates for an employer
  async getTemplatesByEmployer(employerId) {
    try {
      const response = await this.apiClient.get(
        `${this.baseEndpoint}/getTemplates/${employerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching templates by employer:", error);
      throw error;
    }
  }

  // Add a new template
  async addTemplate(templateData) {
    try {
      const response = await this.apiClient.post(
        `${this.baseEndpoint}/addTemplates`,
        templateData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding template:", error);
      throw error;
    }
  }

  // Delete a template
  async deleteTemplate(templateId) {
    try {
      const response = await this.apiClient.delete(
        `${this.baseEndpoint}/deleteTemplate/${templateId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  // Transform template data for frontend
  transformTemplateForFrontend(backendTemplate) {
    return {
      id: backendTemplate.id,
      name: backendTemplate.name || "Mẫu email",
      subject: backendTemplate.subject || "",
      content: backendTemplate.template || backendTemplate.content || "",
      uploadDate: backendTemplate.created_at
        ? new Date(backendTemplate.created_at).toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN"),
      type: backendTemplate.type || "custom",
      employerId: backendTemplate.employer_id,
      candidateId: backendTemplate.candidate_id,
    };
  }

  // Transform template data for backend
  transformTemplateForBackend(
    frontendTemplate,
    employerId,
    candidateId = null
  ) {
    return {
      name: frontendTemplate.name || frontendTemplate.title,
      subject: frontendTemplate.subject,
      template: frontendTemplate.content || frontendTemplate.template,
      employerId: employerId,
      candidate_id: candidateId,
      type: frontendTemplate.type || "custom",
    };
  }
}

export default EmailTemplateRepository;
