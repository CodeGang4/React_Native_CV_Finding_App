import { useState, useEffect, useCallback } from "react";
import CompanyApiService from "../services/api/CompanyApiService";
import JobApiService from "../services/api/JobApiService";

/**
 * Custom hook: useVerifiedCompanies
 * -> Lấy danh sách công ty được xác nhận + tìm kiếm + lấy job theo công ty
 */
export const useVerifiedCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [companyJobs, setCompanyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobError, setJobError] = useState(null);

  const fetchVerifiedCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await CompanyApiService.getVerifiedCompanies();

      const formatted = response.map((company) => ({
        id: company.user_id || company.id,
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

      setCompanies(formatted);
      setFilteredCompanies(formatted);

      console.log(
        "[useVerifiedCompanies] Loaded",
        formatted.length,
        "companies"
      );
    } catch (err) {
      console.error("[useVerifiedCompanies] Error:", err);
      setError(err.message || "Không thể tải danh sách công ty");
    } finally {
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

  const fetchJobsByCompany = useCallback(async (companyId) => {
    if (!companyId) return;

    try {
      setLoadingJobs(true);
      setJobError(null);

      const jobs = await JobApiService.getJobsByCompany(companyId);

      const formatted = jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        salary: job.salary,
        created_at: job.created_at,
      }));

      setCompanyJobs(formatted);
      console.log(
        `[useVerifiedCompanies] Loaded ${formatted.length} jobs for company ${companyId}`
      );

      return formatted;
    } catch (err) {
      console.error("[useVerifiedCompanies] Job fetch error:", err);
      setJobError(err.message || "Không thể tải danh sách công việc");
      return [];
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifiedCompanies();
  }, [fetchVerifiedCompanies]);

  return {
    companies,
    filteredCompanies,
    loading,
    error,
    refetch: fetchVerifiedCompanies,
    search: searchCompanies,
    
    companyJobs,
    loadingJobs,
    jobError,
    fetchJobsByCompany,
  };
};

export default useVerifiedCompanies;
