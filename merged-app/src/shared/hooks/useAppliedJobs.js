// hooks/useAppliedJobs.js
import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import ApplicationApiService from "../services/api/ApplicationApiService";
import HomeApiService from "../services/api/HomeApiService";

export default function useAppliedJobs() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppliedJobs = useCallback(
    async (force = false) => {
      if (!user?.id) return;
      if (!force && jobs.length > 0) return;

      setLoading(!force);
      setRefreshing(force);

      try {
        const applications = await ApplicationApiService.getApplicationByCandidate(user.id);

        const allJobs = await HomeApiService.getJobs();

        const jobsWithDetails = await Promise.all(
          applications.map(async (app) => {
            const jobDetail = allJobs.find((job) => job.id === app.job_id) || {};
            let company = {};
            try {
              if (app.employer_id && app.employer_id !== 'undefined' && app.employer_id !== null) {
                company = await HomeApiService.getCompanyByEmployerId(app.employer_id);
              } else {
                company = { company_name: "Không rõ công ty", company_logo: null };
              }
            } catch {
              company = { company_name: "Không rõ công ty", company_logo: null };
            }

            return {
              id: app.id,
              title: jobDetail.title || "N/A",
              salary: jobDetail.salary || "N/A",
              location: jobDetail.location || "N/A",
              companyName: company.company_name || "N/A",
              companyLogo: company.company_logo || null,
              status: app.status || "unknown",
            };
          })
        );

        setJobs(jobsWithDetails);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        Alert.alert("Lỗi", "Không thể lấy danh sách việc làm đã ứng tuyển.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, jobs.length]
  );

  useEffect(() => {
    if (isFocused) fetchAppliedJobs(false);
  }, [isFocused, fetchAppliedJobs]);

  const handleRefresh = useCallback(() => {
    fetchAppliedJobs(true);
  }, [fetchAppliedJobs]);

  return { jobs, loading, refreshing, handleRefresh };
}
