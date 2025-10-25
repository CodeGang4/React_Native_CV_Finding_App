import { useState, useEffect, useCallback } from "react";
import HomeApiService from "../services/api/HomeApiService";

export default function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isJobExpired = useCallback((job) => {
    if (job.is_expired) return true;
    if (job.expired_date) return new Date(job.expired_date) < new Date();
    return false;
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobList = await HomeApiService.getJobs();
      const validJobs = jobList.filter((job) => !isJobExpired(job));

      const uniqueEmployerIds = [
        ...new Set(validJobs.map((job) => job.employer_id)),
      ];

      const companyMap = {};
      for (const id of uniqueEmployerIds) {
        try {
          const company = await HomeApiService.getCompanyByEmployerId(id);
          companyMap[id] = company;
        } catch {
          companyMap[id] = {
            company_name: "Không rõ công ty",
            company_logo: null,
          };
        }
      }

      const jobsWithCompany = validJobs.map((job) => {
        const company = companyMap[job.employer_id] || {};
        return {
          ...job,
          company_name:
            company.company_name || company.name || "Không rõ công ty",
          company_logo: company.company_logo || company.logo || null,
          company_address: job.location ||company.company_address || "Không rõ địa chỉ",
        };
      });

      setJobs(jobsWithCompany);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [isJobExpired]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return { jobs, loading, loadJobs };
}
