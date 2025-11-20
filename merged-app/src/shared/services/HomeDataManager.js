import { useState, useEffect } from "react";
import HomeApiService from "../services/api/HomeApiService.js";
import { requestQueue } from "../services/utils/RequestQueue.js";

/**
 * Centralized Home Data Manager - Tránh multiple hooks fetch đồng thời
 */
class HomeDataManager {
  constructor() {
    this.data = {
      jobs: [],
      topJobs: [],
      companies: [],
      podcasts: [],
    };
    this.loading = {
      jobs: false,
      companies: false,
      podcasts: false,
    };
    this.error = {
      jobs: null,
      companies: null,
      podcasts: null,
    };
    this.subscribers = [];
    this.initialized = false;
  }

  /**
   * Subscribe to data changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all subscribers
   */
  notify() {
    this.subscribers.forEach((callback) =>
      callback({
        data: this.data,
        loading: this.loading,
        error: this.error,
      })
    );
  }

  /**
   * Initialize all data - chỉ gọi một lần
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    console.log("[HomeDataManager] Initializing all home data...");

    // Set loading states
    this.loading.jobs = true;
    this.loading.companies = true;
    this.loading.podcasts = true;
    this.notify();

    try {
      // Fetch all data concurrently - RequestQueue sẽ serialize
      const [jobsResult, companiesResult, podcastsResult] =
        await Promise.allSettled([
          this.fetchJobs(),
          this.fetchCompanies(),
          this.fetchPodcasts(),
        ]);

      // Handle results
      if (jobsResult.status === "fulfilled") {
        this.data.jobs = jobsResult.value.jobs;
        this.data.topJobs = jobsResult.value.topJobs;
        this.loading.jobs = false;
        this.error.jobs = null;
      } else {
        this.loading.jobs = false;
        this.error.jobs = jobsResult.reason?.message || "Jobs fetch failed";
      }

      if (companiesResult.status === "fulfilled") {
        this.data.companies = companiesResult.value;
        this.loading.companies = false;
        this.error.companies = null;
      } else {
        this.loading.companies = false;
        this.error.companies =
          companiesResult.reason?.message || "Companies fetch failed";
      }

      if (podcastsResult.status === "fulfilled") {
        this.data.podcasts = podcastsResult.value;
        this.loading.podcasts = false;
        this.error.podcasts = null;
      } else {
        this.loading.podcasts = false;
        this.error.podcasts =
          podcastsResult.reason?.message || "Podcasts fetch failed";
      }

      this.notify();
      console.log("[HomeDataManager] Initialization complete");
    } catch (error) {
      console.error("[HomeDataManager] Initialization failed:", error);
    }
  }

  /**
   * Fetch jobs data
   */
  async fetchJobs() {
    const [allJobs, bestJobs] = await Promise.all([
      HomeApiService.getJobs(),
      HomeApiService.getTopJobs(3),
    ]);

    // Transform with company info
    const transformJob = async (job) => {
      let companyInfo = null;
      if (job.employer_id && job.employer_id !== 'undefined' && job.employer_id !== null) {
        try {
          companyInfo = await HomeApiService.getCompanyByEmployerId(
            job.employer_id
          );
        } catch (error) {
          // Ignore company fetch errors
        }
      }

      return {
        // Keep all original job data
        ...job,
        // Override/add specific fields for display
        id: job.id,
        title: job.title || job.position || "Chưa có tiêu đề",
        company:
          companyInfo?.company_name ||
          job.company_name ||
          "Chưa có tên công ty",
        company_name:
          companyInfo?.company_name ||
          job.company_name ||
          "Chưa có tên công ty",
        salary: job.salary || "Thỏa thuận",
        location: job.location || job.city || "Chưa có địa điểm",
        logo: companyInfo?.company_logo || this.getLogoForJob(job),
        company_logo: companyInfo?.company_logo || this.getLogoForJob(job),
        verified: companyInfo?.isverified || job.isverified || false,
        // Ensure important job detail fields are available
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "", // Note: benefits might not be in API response
        deadline: job.expired_date || job.deadline || "",
        experience: job.education || job.experience || "", // Using education field from API
        skills: job.skills || [],
        job_type: job.job_type || "",
        quantity: job.quantity || 1,
        education: job.education || "",
        employer_id: job.employer_id,
        views: job.views || 0,
        applications: job.applications || 0,
        shortlisted: job.shortlisted || 0,
      };
    };

    // Hiển thị toàn bộ jobs từ database thay vì chỉ 3 jobs đầu tiên
    const jobs = await Promise.all(allJobs.map(transformJob));
    const topJobs = await Promise.all(bestJobs.map(transformJob));

    return { jobs, topJobs };
  }

  /**
   * Fetch companies data
   */
  async fetchCompanies() {
    const topCompanies = await HomeApiService.getTopCompanies(4);

    console.log('[HomeDataManager] Raw companies from API:', topCompanies.length);
    if (topCompanies.length > 0) {
      console.log('[HomeDataManager] First raw company:', topCompanies[0]);
    }

    const transformCompany = (company) => {
      // Try multiple possible ID fields in order of preference
      const companyId = company.user_id || company.employer_id || company.company_id || company.id;
      
      console.log('[HomeDataManager] Transforming company:', {
        raw_user_id: company.user_id,
        raw_employer_id: company.employer_id,
        raw_company_id: company.company_id,
        raw_id: company.id,
        selected_id: companyId,
        name: company.company_name
      });
      
      if (!companyId) {
        console.warn('[HomeDataManager] Company missing ID:', company);
      }

      return {
        id: companyId,
        user_id: company.user_id, // Preserve original ID fields for API calls
        employer_id: company.employer_id || company.user_id,
        company_id: company.company_id,
        name: company.company_name || "Chưa có tên công ty",
        category: this.getCompanyCategory(company.industry),
        logo: company.company_logo || this.getLogoForIndustry(company.industry),
        tag: company.unique_candidates > 10 ? "VNR500" : "",
      };
    };

    const transformed = topCompanies.map(transformCompany);
    console.log('[HomeDataManager] Transformed companies:', transformed);
    return transformed;
  }

  /**
   * Fetch podcasts data
   */
  async fetchPodcasts() {
    const allPodcasts = await HomeApiService.getPodcasts();

    const transformPodcast = (podcast) => ({
      id: podcast.id,
      title: podcast.title || "Chưa có tiêu đề",
      duration: this.formatDuration(
        podcast.duration || podcast.length || "00:00:00"
      ),
      thumbnail: podcast.thumbnail || null,
    });

    return allPodcasts.slice(0, 3).map(transformPodcast);
  }

  // Helper methods
  getLogoForJob(job) {
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
    }
    return "🏢";
  }

  getCompanyCategory(industry) {
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
    }
    return industry;
  }

  getLogoForIndustry(industry) {
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
    }
    return "🏢";
  }

  formatDuration(duration) {
    if (!duration) return "00:00";
    // Simple format logic
    return duration.includes(":") ? duration.substring(0, 5) : "00:00";
  }

  /**
   * Reset manager state
   */
  reset() {
    this.initialized = false;
    this.data = { jobs: [], topJobs: [], companies: [], podcasts: [] };
    this.loading = { jobs: false, companies: false, podcasts: false };
    this.error = { jobs: null, companies: null, podcasts: null };
    requestQueue.clearCache();
  }
}

// Singleton instance
export const homeDataManager = new HomeDataManager();

/**
 * Hook để sử dụng home data manager
 */
export function useHomeData() {
  const [state, setState] = useState({
    data: homeDataManager.data,
    loading: homeDataManager.loading,
    error: homeDataManager.error,
  });

  useEffect(() => {
    const unsubscribe = homeDataManager.subscribe(setState);

    // Initialize if not already done
    homeDataManager.initialize();

    return unsubscribe;
  }, []);

  return state;
}

export default homeDataManager;
