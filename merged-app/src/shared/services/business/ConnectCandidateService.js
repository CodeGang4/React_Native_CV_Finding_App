import { apiClient } from "../api/ApiClient.js";
import { CandidateRepository } from "../../repositories/CandidateRepository.js";

/**
 * Candidate Service - Business logic for candidate operations in Connect feature
 */
class CandidateService {
  constructor() {
    this.candidateRepository = new CandidateRepository(apiClient);
  }

  // Get all candidates for Connect screen
  async getAllCandidates(filters = {}) {
    try {
      const result = await this.candidateRepository.getCandidates(filters);
      return result;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      // Return empty result on error to prevent app crash
      return {
        candidates: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }

  // Search candidates with query and filters
  async searchCandidates(query, filters = {}) {
    try {
      // If no query provided, get all candidates with filters
      if (!query || query.trim() === "") {
        return await this.getAllCandidates(filters);
      }

      const result = await this.candidateRepository.searchCandidates(
        query,
        filters
      );
      return result;
    } catch (error) {
      console.error("Error searching candidates:", error);
      // Fallback to client-side filtering if backend search fails
      const allCandidates = await this.getAllCandidates(filters);

      if (query && query.trim() !== "") {
        const filteredCandidates = allCandidates.candidates.filter(
          (candidate) => {
            const searchLower = query.toLowerCase();
            return (
              candidate.name.toLowerCase().includes(searchLower) ||
              candidate.title.toLowerCase().includes(searchLower) ||
              candidate.location.toLowerCase().includes(searchLower) ||
              candidate.skills.some((skill) =>
                skill.toLowerCase().includes(searchLower)
              )
            );
          }
        );

        return {
          ...allCandidates,
          candidates: filteredCandidates,
          total: filteredCandidates.length,
        };
      }

      return allCandidates;
    }
  }

  // Filter candidates by level
  filterByLevel(candidates, level) {
    if (!level || level === "all") {
      return candidates;
    }

    return candidates.filter((candidate) => candidate.level === level);
  }

  // Filter candidates by skills
  filterBySkills(candidates, skills) {
    if (!skills || skills.length === 0) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      return skills.every((skill) =>
        candidate.skills.some((candidateSkill) =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });
  }

  // Apply all filters to candidates
  applyFilters(candidates, filters = {}) {
    let filtered = [...candidates];

    // Filter by search query
    if (filters.query && filters.query.trim() !== "") {
      const searchLower = filters.query.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.title.toLowerCase().includes(searchLower) ||
          candidate.location.toLowerCase().includes(searchLower) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filter by level
    filtered = this.filterByLevel(filtered, filters.level);

    // Filter by skills
    filtered = this.filterBySkills(filtered, filters.skills);

    return filtered;
  }

  // Get unique skills from all candidates
  async getAllSkills() {
    try {
      const result = await this.getAllCandidates();
      const allSkills = new Set();

      result.candidates.forEach((candidate) => {
        candidate.skills.forEach((skill) => {
          if (skill && skill.trim()) {
            allSkills.add(skill.trim());
          }
        });
      });

      return Array.from(allSkills).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error("Error getting all skills:", error);
      return [];
    }
  }

  // Get candidate by ID (for detail view)
  async getCandidateById(candidateId) {
    try {
      return await this.candidateRepository.getCandidateById(candidateId);
    } catch (error) {
      console.error(`Error fetching candidate ${candidateId}:`, error);
      throw new Error(`Không thể tải thông tin ứng viên: ${error.message}`);
    }
  }

  // Send interview invitation (placeholder - to be implemented)
  async sendInterviewInvitation(candidateId, invitationData) {
    try {
      // This would call backend API to send invitation
      console.log("Sending interview invitation:", {
        candidateId,
        invitationData,
      });
      return {
        success: true,
        message: "Lời mời phỏng vấn đã được gửi thành công!",
      };
    } catch (error) {
      console.error("Error sending interview invitation:", error);
      throw new Error(`Không thể gửi lời mời phỏng vấn: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new CandidateService();
