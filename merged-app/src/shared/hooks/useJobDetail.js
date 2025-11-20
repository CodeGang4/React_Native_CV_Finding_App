import { useState, useEffect, useCallback } from "react";
import useSavedJobs from "./useSavedJobs";
import useApplications from "./useApplications";
import HomeApiService from "../services/api/HomeApiService";

/**
 Hook quản lý chi tiết 1 công việc
 Bao gồm:
 Thông tin công ty
 Trạng thái lưu công việc (saved)
 Trạng thái ứng tuyển
 Chống spam khi lưu công việc
 */
export default function useJobDetail(job, userId) {
  const { savedJobs, toggleSaveJob, fetchSavedJobs } = useSavedJobs();
  const { getApplicationsByCandidate, applyToJob } = useApplications();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSaved = savedJobs?.includes(job?.id);

  const loadJobDetail = useCallback(async () => {
    if (!job) return;
    setLoading(true);
    try {
      // Fetch company data if employer_id exists and is valid
      if (job.employer_id && job.employer_id !== 'undefined' && job.employer_id !== null) {
        const companyData = await HomeApiService.getCompanyByEmployerId(
          job.employer_id
        );
        setCompany(companyData);
      } else {
        setCompany({
          company_name: "Không rõ công ty",
          company_logo: null,
          company_address: "Không rõ địa chỉ",
        });
      }

      await fetchSavedJobs();

      if (userId) {
        const userApplications = await getApplicationsByCandidate(userId);
        const applied = userApplications.some((app) => app.job_id === job.id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error loading job detail:", error);
      setCompany({
        company_name: "Không rõ công ty",
        company_logo: null,
        company_address: "Không rõ địa chỉ",
      });
    } finally {
      setLoading(false);
    }
  }, [job, userId, fetchSavedJobs, getApplicationsByCandidate]);

  const handleApply = useCallback(async () => {
    if (!userId) throw new Error("User not logged in");
    if (hasApplied) throw new Error("Already applied");
    if (!job?.id) throw new Error("Job ID is invalid");

    setApplying(true);
    try {
      await applyToJob(userId, job.id);
      setHasApplied(true);
      return true;
    } catch (error) {
      console.error("Error applying job:", error);
      throw error;
    } finally {
      setApplying(false);
    }
  }, [userId, job, hasApplied, applyToJob]);

  const handleToggleSave = useCallback(async () => {
    if (!job?.id) return;
    if (saving) return; 

    setSaving(true);
    try {
      await toggleSaveJob(job.id);
    } catch (error) {
      console.error("Error toggling save job:", error);
    } finally {
      setSaving(false);
    }
  }, [job, toggleSaveJob, saving]);

  useEffect(() => {
    loadJobDetail();
  }, [loadJobDetail]);

  return {
    company,
    loading,
    applying,
    hasApplied,
    isSaved,
    saving,
    handleApply,
    handleToggleSave,
    refresh: loadJobDetail,
  };
}
