import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";

/**
 * Custom hook to fetch and manage jobs data for home page
 */
export const useHomeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allJobs, bestJobs] = await Promise.all([
        HomeApiService.getJobs(),
        HomeApiService.getTopJobs(3), // Chỉ lấy 3 top jobs
      ]);

      // Transform data for UI with company info
      const transformJobWithCompany = async (job) => {
        let companyInfo = null;

        // Lấy thông tin công ty nếu có employer_id
        if (job.employer_id) {
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

      // Transform jobs with company info - chỉ lấy 3 jobs cho home
      const suggestionsJobs = await Promise.all(
        allJobs.slice(0, 3).map(transformJobWithCompany)
      );

      const bestJobsData = await Promise.all(
        bestJobs.map(transformJobWithCompany)
      );

      setJobs(suggestionsJobs);
      setTopJobs(bestJobsData);

      console.log("[useHomeJobs] Data loaded successfully");
    } catch (err) {
      setError(err.message);
      console.error("[useHomeJobs] Error:", err);
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
    fetchJobs();
  }, []);

  return {
    jobs,
    topJobs,
    loading,
    error,
    refetch: fetchJobs,
  };
};

export default useHomeJobs;
