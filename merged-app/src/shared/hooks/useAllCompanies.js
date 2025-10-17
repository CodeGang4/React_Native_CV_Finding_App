import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";

/**
 * Custom hook to fetch and manage ALL companies data for companies listing page
 */
export const useAllCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const allCompanies = await HomeApiService.getTopCompanies(50); // Lấy nhiều hơn cho trang chi tiết

      // Transform data for UI
      const transformCompany = (company) => ({
        id: company.user_id || company.id,
        name: company.company_name || "Chưa có tên công ty",
        category: getCompanyCategory(company.industry),
        logo: company.company_logo || getLogoForIndustry(company.industry), // Sử dụng company_logo từ backend
        tag: company.candidate_count > 50 ? "VNR500" : "",
        candidate_count: company.candidate_count || 0,
        industry: company.industry,
      });

      setCompanies(allCompanies.map(transformCompany));

      console.log("[useAllCompanies] All data loaded successfully");
    } catch (err) {
      setError(err.message);
      console.error("[useAllCompanies] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category based on industry
  const getCompanyCategory = (industry) => {
    if (!industry) return "Chưa phân loại";

    const industryLower = industry.toLowerCase();

    if (
      industryLower.includes("ngân hàng") ||
      industryLower.includes("tài chính")
    ) {
      return "Ngân hàng";
    } else if (
      industryLower.includes("công nghệ") ||
      industryLower.includes("cntt")
    ) {
      return "Công nghệ";
    } else if (
      industryLower.includes("sản xuất") ||
      industryLower.includes("chế tạo")
    ) {
      return "Sản xuất";
    } else if (industryLower.includes("bất động sản")) {
      return "Bất động sản";
    } else if (industryLower.includes("giáo dục")) {
      return "Giáo dục";
    } else if (industryLower.includes("y tế")) {
      return "Y tế";
    }

    return industry;
  };

  // Helper function to get logo based on industry
  const getLogoForIndustry = (industry) => {
    if (!industry) return "🏢";

    const industryLower = industry.toLowerCase();

    if (
      industryLower.includes("ngân hàng") ||
      industryLower.includes("tài chính")
    ) {
      return "🏦";
    } else if (
      industryLower.includes("công nghệ") ||
      industryLower.includes("cntt")
    ) {
      return "💻";
    } else if (
      industryLower.includes("sản xuất") ||
      industryLower.includes("chế tạo")
    ) {
      return "🏭";
    } else if (industryLower.includes("bất động sản")) {
      return "🏘️";
    } else if (industryLower.includes("giáo dục")) {
      return "📚";
    } else if (industryLower.includes("y tế")) {
      return "🏥";
    } else if (industryLower.includes("bán lẻ")) {
      return "🛍️";
    }

    return "🏢"; // Default
  };

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchAllCompanies,
  };
};

export default useAllCompanies;
