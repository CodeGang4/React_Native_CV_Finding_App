import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";

/**
 * Custom hook to fetch and manage ALL jobs data for jobs listing page
 */
export const useAllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allJobs, bestJobs] = await Promise.all([
        HomeApiService.getJobs(),
        HomeApiService.getTopJobs(20), // Lấy nhiều hơn cho trang chi tiết
      ]);

      // Transform data for UI with company info
      const transformJobWithCompany = async (job) => {
        let companyInfo = null;

        // Lấy thông tin công ty nếu có employer_id
        if (job.employer_id && job.employer_id !== 'undefined' && job.employer_id !== null) {
          try {
            companyInfo = await HomeApiService.getCompanyByEmployerId(
              job.employer_id
            );
          } catch (error) {
            console.warn(
              `Không thể lấy thông tin công ty cho employer_id: ${job.employer_id}`,
              error
            );
          }
        }

        return {
          id: job.id,
          title: job.title || job.position || "Chưa có tiêu đề",
          company:
            companyInfo?.company_name ||
            job.company_name ||
            "Chưa có tên công ty",
          salary: job.salary || "Thỏa thuận",
          location: job.location || job.city || "Chưa có địa điểm",
          logo: companyInfo?.company_logo || getLogoForJob(job),
          verified: companyInfo?.isverified || job.isverified || false,
        };
      };

      // Transform ALL jobs with company info
      const allJobsData = await Promise.all(
        allJobs.map(transformJobWithCompany)
      );

      const bestJobsData = await Promise.all(
        bestJobs.map(transformJobWithCompany)
      );

      setJobs(allJobsData);
      setTopJobs(bestJobsData);

      console.log("[useAllJobs] All data loaded successfully");
    } catch (err) {
      setError(err.message);
      console.error("[useAllJobs] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get logo based on job/company info
  const getLogoForJob = (job) => {
    const industry = job.industry?.toLowerCase();

    if (
      industry?.includes("công nghệ") ||
      job.title?.toLowerCase().includes("developer")
    ) {
      return "💻";
    } else if (
      industry?.includes("ngân hàng") ||
      industry?.includes("tài chính")
    ) {
      return "🏦";
    } else if (industry?.includes("giáo dục")) {
      return "📚";
    } else if (industry?.includes("y tế")) {
      return "🏥";
    } else if (industry?.includes("bán lẻ")) {
      return "🛍️";
    }

    return "🏢"; // Default company logo
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  return {
    jobs,
    topJobs,
    loading,
    error,
    refetch: fetchAllJobs,
  };
};

export default useAllJobs;
