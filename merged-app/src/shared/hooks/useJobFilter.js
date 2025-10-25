import { useMemo } from "react";

export default function useJobFilter(jobs, searchQuery = "", location = "", trigger = 0) {
  const removeVietnameseTones = (str = "") =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
       .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

  const filteredJobs = useMemo(() => {
    const query = removeVietnameseTones(searchQuery);
    const loc = removeVietnameseTones(location);

    return jobs.filter((job) => {
      const titleMatch = removeVietnameseTones(job.title || "").includes(query);
      const companyMatch = removeVietnameseTones(job.company_name || "").includes(query);
      const locationMatch = !loc || removeVietnameseTones(job.location || "").includes(loc);
      return (titleMatch || companyMatch) && locationMatch;
    });
  }, [jobs, searchQuery, location, trigger]);

  return filteredJobs;
}
