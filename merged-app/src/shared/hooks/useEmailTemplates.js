import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import EmailTemplateRepository from "../repositories/EmailTemplateRepository";
import { useAuth } from "../contexts/AuthContext";

export const useEmailTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const emailTemplateRepository = new EmailTemplateRepository();

  // Fetch templates for current employer
  const fetchTemplates = useCallback(async () => {
    if (!user?.id) {
      console.warn(" No user ID available for fetching templates");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching templates for employer:", user.id);
      const fetchedTemplates =
        await emailTemplateRepository.getTemplatesByEmployer(user.id);

      // Transform backend data to frontend format
      const transformedTemplates = Array.isArray(fetchedTemplates)
        ? fetchedTemplates.map((template) =>
            emailTemplateRepository.transformTemplateForFrontend(template)
          )
        : [];

      console.log(
        " Templates fetched successfully:",
        transformedTemplates.length
      );
      setTemplates(transformedTemplates);
    } catch (err) {
      console.error(" Error fetching templates:", err);
      setError(err.message || "Không thể tải danh sách mẫu email");

      // For now, don't show error alert to avoid disrupting UX
      // We can use fallback static templates
      setTemplates(getDefaultTemplates());
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Create a new template
  const createTemplate = useCallback(
    async (templateData) => {
      if (!user?.id) {
        Alert.alert("Lỗi", "Không thể xác định thông tin người dùng");
        return false;
      }

      try {
        setCreating(true);
        setError(null);

        console.log("Creating template:", templateData.name);

        // Transform data for backend
        const backendData = emailTemplateRepository.transformTemplateForBackend(
          templateData,
          user.id
        );

        const newTemplate = await emailTemplateRepository.addTemplate(
          backendData
        );

        // Transform and add to local state
        const transformedTemplate =
          emailTemplateRepository.transformTemplateForFrontend(newTemplate);
        setTemplates((prevTemplates) => [
          transformedTemplate,
          ...prevTemplates,
        ]);

        console.log(" Template created successfully");
        return true;
      } catch (err) {
        console.error(" Error creating template:", err);
        setError(err.message || "Không thể tạo mẫu email mới");

        Alert.alert("Lỗi", "Không thể tạo mẫu email mới. Vui lòng thử lại.", [
          { text: "OK" },
        ]);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [user?.id]
  );

  // Create template with user feedback
  const createTemplateWithFeedback = useCallback(
    async (templateData) => {
      const success = await createTemplate(templateData);
      if (success) {
        Alert.alert("Thành công", "Đã tạo mẫu email mới!", [{ text: "OK" }]);
      }
      return success;
    },
    [createTemplate]
  );

  // Delete a template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      setDeleting(true);
      setError(null);

      console.log("Deleting template:", templateId);
      await emailTemplateRepository.deleteTemplate(templateId);

      // Remove from local state
      setTemplates((prevTemplates) =>
        prevTemplates.filter((template) => template.id !== templateId)
      );

      console.log(" Template deleted successfully");
      return true;
    } catch (err) {
      console.error(" Error deleting template:", err);
      setError(err.message || "Không thể xóa mẫu email");

      Alert.alert("Lỗi", "Không thể xóa mẫu email. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  // Delete template with confirmation
  const deleteTemplateWithConfirmation = useCallback(
    (templateId) => {
      const template = templates.find((t) => t.id === templateId);
      const templateName = template?.name || "mẫu email này";

      Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${templateName}"?`, [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await deleteTemplate(templateId);
            if (success) {
              Alert.alert("Đã xóa", "Mẫu email đã được xóa");
            }
          },
        },
      ]);
    },
    [templates, deleteTemplate]
  );

  // Get default templates as fallback
  const getDefaultTemplates = useCallback(() => {
    return [
      {
        id: "default_1",
        name: "Mẫu thông báo phỏng vấn",
        subject: "Thông báo lịch phỏng vấn - {position}",
        content:
          "Chào {candidate_name},\n\nChúng tôi rất vui mừng thông báo rằng hồ sơ của bạn đã được chọn để tham gia phỏng vấn cho vị trí {position} tại công ty chúng tôi.\n\nThông tin phỏng vấn:\n- Thời gian: {interview_time}\n- Địa điểm: {interview_location}\n- Liên hệ: {contact_info}\n\nVui lòng xác nhận tham gia phỏng vấn qua email này.\n\nTrân trọng,\n{company_name}",
        uploadDate: new Date().toLocaleDateString("vi-VN"),
        type: "default",
      },
      {
        id: "default_2",
        name: "Mẫu chúc mừng trúng tuyển",
        subject: "Chúc mừng bạn đã trúng tuyển vị trí {position}",
        content:
          "Chào {candidate_name},\n\nChúc mừng bạn đã được chọn cho vị trí {position} tại {company_name}!\n\nChúng tôi rất ấn tượng với kỹ năng và kinh nghiệm của bạn. Chúng tôi tin rằng bạn sẽ là một bổ sung tuyệt vời cho đội ngũ của chúng tôi.\n\nThông tin làm việc:\n- Ngày bắt đầu: {start_date}\n- Mức lương: {salary}\n- Địa điểm làm việc: {work_location}\n\nVui lòng liên hệ với chúng tôi để hoàn tất các thủ tục.\n\nTrân trọng,\n{company_name}",
        uploadDate: new Date().toLocaleDateString("vi-VN"),
        type: "default",
      },
    ];
  }, []);

  // Load templates on mount
  useEffect(() => {
    if (user?.id) {
      fetchTemplates();
    } else {
      // Use default templates if no user
      setTemplates(getDefaultTemplates());
    }
  }, [user?.id, fetchTemplates, getDefaultTemplates]);

  return {
    // Data
    templates,

    // Loading states
    loading,
    creating,
    deleting,
    error,

    // Actions
    fetchTemplates,
    createTemplate,
    createTemplateWithFeedback,
    deleteTemplate,
    deleteTemplateWithConfirmation,
  };
};
