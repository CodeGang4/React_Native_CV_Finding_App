import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import employerBusinessService from "../services/business/EmployerBusinessService";

/**
 * Custom hook for managing company information
 */
export const useCompanyInfo = (companyId = null) => {
  const { user } = useAuth();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Sử dụng companyId từ props hoặc user.id
  const activeCompanyId = companyId || user?.id;

  // Fetch company info
  const fetchCompanyInfo = useCallback(
    async (forceRefresh = false) => {
      // Validate company ID before fetching
      if (!activeCompanyId || activeCompanyId === 'undefined' || activeCompanyId === null) {
        const errorMsg = `Invalid company ID: ${activeCompanyId}`;
        setError(errorMsg);
        console.warn("[useCompanyInfo]", errorMsg);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const info = await employerBusinessService.getCompanyInfo(
          activeCompanyId,
          forceRefresh
        );
        setCompanyInfo(info);
      } catch (err) {
        setError(err.message);
        console.error("[useCompanyInfo] Fetch company info error:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeCompanyId]
  );

  // Update company info
  const updateCompanyInfo = useCallback(
    async (updateData) => {
      if (!activeCompanyId) {
        throw new Error("No company ID available");
      }

      setUpdating(true);
      setError(null);

      try {
        const updatedInfo = await employerBusinessService.updateCompanyInfo(
          activeCompanyId,
          updateData
        );
        setCompanyInfo(updatedInfo);
        return updatedInfo;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [activeCompanyId]
  );

  // Update company name
  const updateCompanyName = useCallback(
    async (companyName) => {
      if (!activeCompanyId) {
        throw new Error("No company ID available");
      }

      setUpdating(true);
      setError(null);

      try {
        const updatedInfo = await employerBusinessService.updateCompanyName(
          activeCompanyId,
          companyName
        );
        setCompanyInfo(updatedInfo);
        return updatedInfo;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [activeCompanyId]
  );

  // Upload company logo
  const uploadCompanyLogo = useCallback(
    async (imageFile) => {
      if (!activeCompanyId) {
        throw new Error("No company ID available");
      }

      setUpdating(true);
      setError(null);

      try {
        const result = await employerBusinessService.uploadCompanyLogo(
          activeCompanyId,
          imageFile
        );

        // Cập nhật logo trong state hiện tại
        if (companyInfo) {
          setCompanyInfo({
            ...companyInfo,
            logo: result.logo_url,
          });
        }

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [activeCompanyId, companyInfo]
  );

  // Refresh company info
  const refreshCompanyInfo = useCallback(() => {
    return fetchCompanyInfo(true);
  }, [fetchCompanyInfo]);

  // Reset error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update company info with user feedback
  const updateCompanyInfoWithFeedback = useCallback(
    async (updateData, options = {}) => {
      const {
        showSuccessAlert = true,
        showErrorAlert = true,
        successMessage = "Cập nhật thông tin công ty thành công!",
      } = options;

      try {
        const result = await updateCompanyInfo(updateData);

        if (showSuccessAlert) {
          Alert.alert("Thành công", successMessage);
        }

        return result;
      } catch (err) {
        if (showErrorAlert) {
          Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi cập nhật");
        }
        throw err;
      }
    },
    [updateCompanyInfo]
  );

  // Update company name with user feedback
  const updateCompanyNameWithFeedback = useCallback(
    async (companyName, options = {}) => {
      const {
        showSuccessAlert = true,
        showErrorAlert = true,
        successMessage = "Cập nhật tên công ty thành công!",
      } = options;

      try {
        const result = await updateCompanyName(companyName);

        if (showSuccessAlert) {
          Alert.alert("Thành công", successMessage);
        }

        return result;
      } catch (err) {
        if (showErrorAlert) {
          Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi cập nhật");
        }
        throw err;
      }
    },
    [updateCompanyName]
  );

  // Upload logo with user feedback
  const uploadLogoWithFeedback = useCallback(
    async (imageFile, options = {}) => {
      const {
        showSuccessAlert = true,
        showErrorAlert = true,
        successMessage = "Upload logo thành công!",
      } = options;

      try {
        const result = await uploadCompanyLogo(imageFile);

        if (showSuccessAlert) {
          Alert.alert("Thành công", successMessage);
        }

        return result;
      } catch (err) {
        if (showErrorAlert) {
          Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi upload logo");
        }
        throw err;
      }
    },
    [uploadCompanyLogo]
  );

  // Load company info when component mounts or activeCompanyId changes
  useEffect(() => {
    if (activeCompanyId) {
      fetchCompanyInfo();
    }
  }, [activeCompanyId, fetchCompanyInfo]);

  return {
    // State
    companyInfo,
    loading,
    error,
    updating,

    // Actions
    fetchCompanyInfo,
    refreshCompanyInfo,
    updateCompanyInfo,
    updateCompanyName,
    uploadCompanyLogo,
    clearError,

    // Actions with user feedback
    updateCompanyInfoWithFeedback,
    updateCompanyNameWithFeedback,
    uploadLogoWithFeedback,

    // Computed properties
    hasCompanyInfo: !!companyInfo,
    isCompanyInfoComplete: !!(
      companyInfo?.name &&
      companyInfo?.address &&
      companyInfo?.website &&
      companyInfo?.description
    ),
  };
};

export default useCompanyInfo;
