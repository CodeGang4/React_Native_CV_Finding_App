import { useState, useEffect, useCallback } from "react";
import CompanyApiService from "../services/api/CompanyApiService";

/**
 * Custom hook: useVerifiedCompanies
 * -> Lấy danh sách công ty được xác nhận + tìm kiếm
 */
export const useVerifiedCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerifiedCompanies = useCallback(async () => {
    try {
      console.log("[useVerifiedCompanies] START fetching companies...");
      setLoading(true);
      setError(null);

      const response = await CompanyApiService.getVerifiedCompanies();
      console.log(" [useVerifiedCompanies] API response:", response);

      // Kiểm tra response có hợp lệ không
      if (!response) {
        throw new Error("Không có dữ liệu trả về");
      }

      if (!Array.isArray(response)) {
        console.error(" [useVerifiedCompanies] Response is not array:", response);
        setError("Dữ liệu công ty không hợp lệ");
        setCompanies([]);
        setFilteredCompanies([]);
        return;
      }

      const formatted = response.map((company, index) => ({
        id: company.user_id || company.id || `temp-${index}`,
        name: company.company_name || "Chưa có tên công ty",
        logo: company.company_logo,
        website: company.company_website,
        address: company.company_address,
        size: company.company_size,
        industry: company.industry,
        contact: company.contact_person,
        description: company.description,
        created_at: company.created_at,
      }));

      console.log(`[useVerifiedCompanies] Formatted ${formatted.length} companies`);
      
      setCompanies(formatted);
      setFilteredCompanies(formatted);

    } catch (err) {
      console.error(" [useVerifiedCompanies] Error:", err);
      setError(err.message || "Không thể tải danh sách công ty");
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      console.log("[useVerifiedCompanies] Loading finished");
      setLoading(false);
    }
  }, []);

  const searchCompanies = useCallback(
    (query = "") => {
      if (!query.trim()) {
        setFilteredCompanies(companies);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results = companies.filter(
        (company) =>
          company.name?.toLowerCase().includes(lowerQuery) ||
          company.industry?.toLowerCase().includes(lowerQuery) ||
          company.address?.toLowerCase().includes(lowerQuery)
      );

      setFilteredCompanies(results);
    },
    [companies]
  );

  useEffect(() => {
    console.log(" [useVerifiedCompanies] Component mounted, fetching companies...");
    fetchVerifiedCompanies();
  }, [fetchVerifiedCompanies]);

  // Effect để log state changes
  useEffect(() => {
    console.log("📈 [useVerifiedCompanies] State updated:", {
      loading,
      error: error ? error.substring(0, 100) : null,
      companiesCount: companies.length,
      filteredCount: filteredCompanies.length
    });
  }, [loading, error, companies, filteredCompanies]);

  return {
    companies,
    filteredCompanies,
    loading,
    error,
    refetch: fetchVerifiedCompanies,
    search: searchCompanies,
  };
};

export default useVerifiedCompanies;
