import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";

/**
 * Custom hook to fetch and manage companies data for home page
 */
export const useHomeCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useHomeCompanies] Starting to fetch companies...");
      const topCompanies = await HomeApiService.getTopCompanies(4);
      console.log("[useHomeCompanies] Raw API response:", topCompanies);

      // Transform data for UI
      const transformCompany = (company) => ({
        id: company.company_id || company.id,
        name: company.company_name || "Chưa có tên công ty",
        category: getCompanyCategory(company.industry),
        logo: company.company_logo || getLogoForIndustry(company.industry), // Sử dụng company_logo từ backend
        tag: company.unique_candidates > 10 ? "VNR500" : "", // Sử dụng unique_candidates thay vì candidate_count
      });

      const transformedCompanies = topCompanies.map(transformCompany);
      console.log(
        "[useHomeCompanies] Transformed companies:",
        transformedCompanies
      );

      setCompanies(transformedCompanies);

      console.log(
        "[useHomeCompanies] Data loaded successfully, count:",
        transformedCompanies.length
      );
    } catch (err) {
      setError(err.message);
      console.error("[useHomeCompanies] Error:", err);
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
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
  };
};

export default useHomeCompanies;
