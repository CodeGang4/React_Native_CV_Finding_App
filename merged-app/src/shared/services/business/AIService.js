import { Candidate } from "../../domain/entities/Candidate.js";

/**
 * AI Service - Handles AI-powered features like candidate scoring and matching
 * This is adapted from the existing aiScoring.js utility
 */
export class AIService {
  // Level weights for scoring
  static levelWeight = {
    junior: 1,
    mid: 2,
    senior: 3,
  };

  /**
   * Score a candidate against target criteria
   * @param {Candidate} candidate - The candidate to score
   * @param {Object} target - Target criteria including skills, level, query
   * @returns {Object} Score and reasons
   */
  static scoreCandidate(candidate, target) {
    if (!candidate) return { score: 0, reasons: [] };

    const reasons = [];
    let score = 0;

    // Skills overlap scoring
    const skillScore = this.calculateSkillScore(candidate, target, reasons);
    score += skillScore;

    // Level preference scoring
    const levelScore = this.calculateLevelScore(candidate, target, reasons);
    score += levelScore;

    // Query match scoring (name/title/location)
    const queryScore = this.calculateQueryScore(candidate, target, reasons);
    score += queryScore;

    // Diversity bonus: more skills
    const diversityScore = Math.min(candidate.skills.length * 1.5, 10);
    score += diversityScore;

    return { score, reasons };
  }

  /**
   * Calculate skill match score
   */
  static calculateSkillScore(candidate, target, reasons) {
    const targetSkills = (target?.skills || []).map((s) =>
      (s || "").toLowerCase()
    );
    const candSkills = (candidate.skills || []).map((s) =>
      (s || "").toLowerCase()
    );

    const overlap = candSkills.filter((s) => targetSkills.includes(s));
    const skillScore = overlap.length * 10 + (overlap.length > 0 ? 10 : 0);

    if (skillScore > 0) {
      reasons.push(`Khớp ${overlap.length} kỹ năng: ${overlap.join(", ")}`);
    }

    return skillScore;
  }

  /**
   * Calculate level match score
   */
  static calculateLevelScore(candidate, target, reasons) {
    if (target?.level && target.level !== "all") {
      const diff = Math.abs(
        (this.levelWeight[target.level] || 0) -
          (this.levelWeight[candidate.level] || 0)
      );
      const levelScore = Math.max(0, 12 - diff * 6); // exact match 12, off by 1 -> 6, off by 2 -> 0

      if (levelScore > 0) {
        reasons.push(`Cấp độ phù hợp: ${this.formatLevel(candidate.level)}`);
      }

      return levelScore;
    } else {
      // Prefer higher seniority slightly when no preference
      return (this.levelWeight[candidate.level] || 0) * 2;
    }
  }

  /**
   * Calculate query match score
   */
  static calculateQueryScore(candidate, target, reasons) {
    const query = (target?.query || "").trim().toLowerCase();

    if (query.length > 0) {
      const fields = [candidate.name, candidate.title, candidate.location].map(
        (x) => (x || "").toLowerCase()
      );
      const hits = fields.filter((f) => f.includes(query)).length;
      const queryScore = hits > 0 ? 8 + (hits - 1) * 2 : 0;

      if (queryScore > 0) {
        reasons.push("Khớp từ khóa tìm kiếm");
      }

      return queryScore;
    }

    return 0;
  }

  /**
   * Rank candidates based on target criteria
   * @param {Candidate[]} candidates - Array of candidates
   * @param {Object} target - Target criteria
   * @param {number} topN - Number of top candidates to return
   * @returns {Candidate[]} Ranked candidates with scores
   */
  static rankCandidates(candidates, target, topN = 3) {
    const ranked = candidates
      .map((c) => ({
        candidate: c,
        result: this.scoreCandidate(c, target),
      }))
      .sort((a, b) => b.result.score - a.result.score);

    return ranked.slice(0, topN).map(({ candidate, result }) => {
      // Add score and reasons to candidate (temporary fields)
      const rankedCandidate =
        candidate instanceof Candidate
          ? candidate
          : Candidate.fromJSON(candidate);

      rankedCandidate.__score = result.score;
      rankedCandidate.__reasons = result.reasons;

      return rankedCandidate;
    });
  }

  /**
   * Find similar candidates based on skills and level
   * @param {Candidate[]} candidates - All candidates
   * @param {Candidate} baseCandidate - Reference candidate
   * @param {number} topN - Number of similar candidates to return
   * @returns {Candidate[]} Similar candidates
   */
  static findSimilarCandidates(candidates, baseCandidate, topN = 5) {
    if (!baseCandidate) return [];

    const baseSkills = new Set(
      (baseCandidate.skills || []).map((s) => (s || "").toLowerCase())
    );

    const similarities = candidates
      .filter((c) => c.id !== baseCandidate.id)
      .map((c) => {
        const cSkills = new Set(
          (c.skills || []).map((s) => (s || "").toLowerCase())
        );

        const intersection = [...cSkills].filter((s) => baseSkills.has(s));
        const union = new Set([...cSkills, ...baseSkills]);
        const jaccard = union.size === 0 ? 0 : intersection.length / union.size; // 0..1

        const levelGap = Math.abs(
          (this.levelWeight[c.level] || 0) -
            (this.levelWeight[baseCandidate.level] || 0)
        );
        const levelBonus = Math.max(0, 1 - levelGap * 0.5); // 1, 0.5, 0

        const score = jaccard * 0.8 + levelBonus * 0.2;

        return { candidate: c, score, overlap: intersection };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    return similarities.map(({ candidate, score, overlap }) => {
      const similarCandidate =
        candidate instanceof Candidate
          ? candidate
          : Candidate.fromJSON(candidate);

      similarCandidate.__sim = score;
      similarCandidate.__overlap = overlap;

      return similarCandidate;
    });
  }

  /**
   * Generate AI-powered candidate suggestions for a job
   * @param {Job} job - The job to find candidates for
   * @param {Candidate[]} candidates - Available candidates
   * @param {number} limit - Maximum number of suggestions
   * @returns {Candidate[]} Suggested candidates
   */
  static generateJobCandidateSuggestions(job, candidates, limit = 10) {
    const target = {
      skills: job.skills || [],
      level: job.level || "all",
      query: `${job.title} ${job.location}`.trim(),
    };

    // Filter candidates by basic criteria
    const eligibleCandidates = candidates.filter((candidate) => {
      // Must be active and available
      if (!candidate.isActive || !candidate.isAvailable) return false;

      // Level match (if specified)
      if (job.level && job.level !== "all" && candidate.level !== job.level) {
        // Allow some flexibility (junior can apply to mid, etc.)
        const jobLevelWeight = this.levelWeight[job.level] || 0;
        const candidateLevelWeight = this.levelWeight[candidate.level] || 0;
        const levelDiff = Math.abs(jobLevelWeight - candidateLevelWeight);
        if (levelDiff > 1) return false;
      }

      // Location match (basic)
      if (job.location && candidate.location) {
        const jobLocation = job.location.toLowerCase();
        const candidateLocation = candidate.location.toLowerCase();
        const candidatePreferredLocations = (
          candidate.preferredLocations || []
        ).map((loc) => loc.toLowerCase());

        const locationMatch =
          candidateLocation.includes(jobLocation) ||
          jobLocation.includes(candidateLocation) ||
          candidatePreferredLocations.some(
            (loc) => loc.includes(jobLocation) || jobLocation.includes(loc)
          );

        if (!locationMatch) return false;
      }

      return true;
    });

    // Rank eligible candidates
    return this.rankCandidates(eligibleCandidates, target, limit);
  }

  /**
   * Generate AI-powered job suggestions for a candidate
   * @param {Candidate} candidate - The candidate to find jobs for
   * @param {Job[]} jobs - Available jobs
   * @param {number} limit - Maximum number of suggestions
   * @returns {Job[]} Suggested jobs with match scores
   */
  static generateCandidateJobSuggestions(candidate, jobs, limit = 10) {
    if (!candidate) return [];

    const suggestions = jobs
      .filter((job) => {
        // Only active jobs
        if (!job.isActive) return false;

        // Not expired
        if (job.isExpired) return false;

        return true;
      })
      .map((job) => {
        let score = 0;
        const reasons = [];

        // Skill match
        const candidateSkills = (candidate.skills || []).map((s) =>
          s.toLowerCase()
        );
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
        const skillOverlap = candidateSkills.filter((s) =>
          jobSkills.includes(s)
        );

        if (skillOverlap.length > 0) {
          score += skillOverlap.length * 15;
          reasons.push(`Khớp ${skillOverlap.length} kỹ năng`);
        }

        // Level match
        if (job.level === "all" || job.level === candidate.level) {
          score += 20;
          reasons.push("Cấp độ phù hợp");
        }

        // Location match
        if (job.location && candidate.location) {
          const jobLocation = job.location.toLowerCase();
          const candidateLocation = candidate.location.toLowerCase();

          if (
            candidateLocation.includes(jobLocation) ||
            jobLocation.includes(candidateLocation)
          ) {
            score += 15;
            reasons.push("Địa điểm phù hợp");
          }
        }

        // Salary match
        if (job.salaryMin && candidate.salaryMin) {
          if (job.salaryMin >= candidate.salaryMin) {
            score += 10;
            reasons.push("Mức lương phù hợp");
          }
        }

        // Job type match
        if (job.jobType === candidate.jobType) {
          score += 5;
          reasons.push("Loại công việc phù hợp");
        }

        return {
          job,
          score,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return suggestions.map(({ job, score, reasons }) => {
      job.__score = score;
      job.__reasons = reasons;
      return job;
    });
  }

  /**
   * Format level for display
   */
  static formatLevel(level) {
    if (!level) return "";
    const map = {
      junior: "Junior",
      mid: "Mid",
      senior: "Senior",
    };
    return map[level] || level;
  }

  /**
   * Calculate match percentage between candidate and job
   */
  static calculateMatchPercentage(candidate, job) {
    const result = this.scoreCandidate(candidate, {
      skills: job.skills,
      level: job.level,
      query: job.title,
    });

    // Normalize score to percentage (rough estimation)
    const maxPossibleScore = 50; // Approximate max score
    return Math.min(100, Math.round((result.score / maxPossibleScore) * 100));
  }
}

export default AIService;
