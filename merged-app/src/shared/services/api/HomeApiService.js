import { apiClient } from "./ApiClient.js";
import { requestQueue } from "../utils/RequestQueue.js";

/**
 * Home API Service - Handles home page data from backend
 */
export class HomeApiService {
  // Get jobs for home page (suggestions and best jobs)
  static async getJobs() {
    return requestQueue.enqueue(
      async () => {
        const response = await fetch("http://192.168.110.49:3000/job/getJobs");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("[HomeApiService] getJobs success:", data.length, "jobs");
        return data;
      },
      "jobs-list" // cache key
    );
  }

  // Get company info by employer_id
  static async getCompanyByEmployerId(employerId) {
    return requestQueue.enqueue(
      async () => {
        const response = await fetch(
          `http://192.168.110.49:3000/employer/getCompanyInfo/${employerId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      },
      `company-${employerId}` // cache key with employer ID
    );
  }

  // Get top jobs by views
  static async getTopJobs(number = 10) {
    return requestQueue.enqueue(
      async () => {
        const response = await fetch(
          `http://192.168.110.49:3000/job/getTopJobs?number=${number}`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(
          "[HomeApiService] getTopJobs success:",
          data.length,
          "top jobs"
        );
        return data;
      },
      `top-jobs-${number}` // cache key with number param
    );
  }

  // Get top companies (only accepted status)
  static async getTopCompanies(number = 10) {
    return requestQueue.enqueue(
      async () => {
        const response = await fetch(
          `http://192.168.110.49:3000/employer/getTopCompanies?number=${number}&status=accepted`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        // Backend đã filter theo status=accepted trong query, nhưng vẫn giữ backup filter
        const acceptedCompanies = data.filter(
          (company) => company.company_name // Chỉ lấy company có tên
        );

        console.log(
          "[HomeApiService] getTopCompanies success:",
          acceptedCompanies.length,
          "accepted companies"
        );
        return acceptedCompanies;
      },
      `top-companies-${number}` // cache key
    );
  }

  // Get podcasts using existing apiClient (this one uses client prefix)
  static async getPodcasts() {
    return requestQueue.enqueue(
      async () => {
        const response = await apiClient.get("/podcast");
        console.log(
          "[HomeApiService] getPodcasts success:",
          response.data.length,
          "podcasts"
        );
        return response.data;
      },
      "podcasts-list" // cache key
    );
  }
}

export default HomeApiService;
