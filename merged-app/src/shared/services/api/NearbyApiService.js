import apiClient from "./ApiClient.js";

/**
 * Nearby API Service
 * Tìm việc làm gần địa chỉ hoặc tọa độ
 */
class NearbyApiService {
  static endpoint = "/address";

  /**
   * Tìm việc làm gần đây theo tọa độ
   * @param {number} latitude - Vĩ độ
   * @param {number} longitude - Kinh độ  
   * @param {number} radius - Bán kính tìm kiếm (km)
   * @returns {Promise} Kết quả tìm kiếm
   */
  static async searchNearbyJobs(latitude, longitude, radius) {
    try {
      // Validate input
      if (!latitude || !longitude) {
        throw new Error("Tọa độ không hợp lệ");
      }
      
      const radiusNum = parseInt(radius);
      if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 100) {
        throw new Error("Bán kính tìm kiếm không hợp lệ (1-100km)");
      }

      console.log("[NearbyApiService] Searching nearby jobs:", {
        latitude,
        longitude, 
        radius: radiusNum
      });

      const response = await apiClient.post(`${this.endpoint}/nearby`, {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusNum.toString(),
      });

      console.log("[NearbyApiService] API response received");

      // Format job data to be consistent with JobListSection expectations
      const formattedJobs = this.formatJobData(response.data.jobs || []);
      
      return {
        ...response.data,
        jobs: formattedJobs,
        count: formattedJobs.length,
      };

    } catch (error) {
      console.error("[NearbyApiService] Nearby search error:", error);
      
      if (error.response?.status === 500) {
        throw new Error("Lỗi server. Vui lòng thử lại sau.");
      } else if (error.response?.status === 404) {
        throw new Error("Không tìm thấy endpoint tìm kiếm.");
      } else if (error.message.includes("Network Error")) {
        throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
      } else {
        throw new Error(error.message || "Không thể tìm kiếm việc làm gần đây");
      }
    }
  }

  /**
   * Format job data to match JobListSection expectations
   * @param {Array} jobs - Danh sách job từ API
   * @returns {Array} Danh sách job đã format
   */
  static formatJobData(jobs) {
    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      salary: job.salary,
      job_type: job.job_type,
      location: job.location,
      latitude: job.latitude,
      longitude: job.longitude,
      distance: job.distance,
      created_at: job.created_at,
      employer_id: job.employer_id,
      requirements: job.requirements,
      
      company_name: job.employers?.company_name || job.employer?.company_name,
      company_logo: job.employers?.company_logo || job.employer?.company_logo,
      company_address: job.location,
      
      company: {
        company_name: job.employers?.company_name || job.employer?.company_name,
        company_logo: job.employers?.company_logo || job.employer?.company_logo,
        company_address: job.location,
      },
      
      employers: job.employers,
      employer: job.employer,
    }));
  }

  /**
   * Validate radius input
   * @param {string|number} radius - Bán kính
   * @returns {boolean} True nếu hợp lệ
   */
  static validateRadius(radius) {
    const radiusNum = parseInt(radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      throw new Error("Bán kính tìm kiếm không hợp lệ");
    }
    if (radiusNum > 100) {
      throw new Error("Bán kính tìm kiếm tối đa là 100km");
    }
    return true;
  }
}

export default NearbyApiService;