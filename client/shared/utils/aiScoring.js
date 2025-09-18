// Heuristic scoring for candidates to emulate AI suggestions locally.
// Inputs: candidate { level, skills, title, location, ... }
// target: { skills: string[], level: 'junior'|'mid'|'senior'|'all', query: string }

const levelWeight = { junior: 1, mid: 2, senior: 3 };

export function scoreCandidate(candidate, target) {
  if (!candidate) return { score: 0, reasons: [] };
  const reasons = [];
  let score = 0;

  // Skills overlap
  const targetSkills = (target?.skills || []).map((s) =>
    (s || "").toLowerCase()
  );
  const candSkills = (candidate.skills || []).map((s) =>
    (s || "").toLowerCase()
  );
  const overlap = candSkills.filter((s) => targetSkills.includes(s));
  const skillScore = overlap.length * 10 + (overlap.length > 0 ? 10 : 0);
  if (skillScore > 0)
    reasons.push(`Khớp ${overlap.length} kỹ năng: ${overlap.join(", ")}`);
  score += skillScore;

  // Level preference
  if (target?.level && target.level !== "all") {
    const diff = Math.abs(
      (levelWeight[target.level] || 0) - (levelWeight[candidate.level] || 0)
    );
    const lvScore = Math.max(0, 12 - diff * 6); // exact match 12, off by 1 -> 6, off by 2 -> 0
    if (lvScore > 0)
      reasons.push(`Cấp độ phù hợp: ${formatLevel(candidate.level)}`);
    score += lvScore;
  } else {
    // Prefer higher seniority slightly when no preference
    score += (levelWeight[candidate.level] || 0) * 2;
  }

  // Query match (name/title/location)
  const q = (target?.query || "").trim().toLowerCase();
  if (q.length > 0) {
    const fields = [candidate.name, candidate.title, candidate.location].map(
      (x) => (x || "").toLowerCase()
    );
    const hits = fields.filter((f) => f.includes(q)).length;
    const qScore = hits > 0 ? 8 + (hits - 1) * 2 : 0;
    if (qScore > 0) reasons.push("Khớp từ khóa tìm kiếm");
    score += qScore;
  }

  // Diversity bonus: more skills
  score += Math.min(candSkills.length * 1.5, 10);

  return { score, reasons };
}

export function rankCandidates(candidates, target, topN = 3) {
  const ranked = candidates
    .map((c) => ({ c, r: scoreCandidate(c, target) }))
    .sort((a, b) => b.r.score - a.r.score);
  return ranked
    .slice(0, topN)
    .map(({ c, r }) => ({ ...c, __score: r.score, __reasons: r.reasons }));
}

export function findSimilarCandidates(candidates, base, topN = 5) {
  if (!base) return [];
  const baseSkills = new Set(
    (base.skills || []).map((s) => (s || "").toLowerCase())
  );
  return candidates
    .filter((c) => c.id !== base.id)
    .map((c) => {
      const cSkills = new Set(
        (c.skills || []).map((s) => (s || "").toLowerCase())
      );
      const inter = [...cSkills].filter((s) => baseSkills.has(s));
      const union = new Set([...cSkills, ...baseSkills]);
      const jaccard = union.size === 0 ? 0 : inter.length / union.size; // 0..1
      const levelGap = Math.abs(
        (levelWeight[c.level] || 0) - (levelWeight[base.level] || 0)
      );
      const levelBonus = Math.max(0, 1 - levelGap * 0.5); // 1, 0.5, 0
      const score = jaccard * 0.8 + levelBonus * 0.2;
      return { c, score, inter };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ c, score, inter }) => ({ ...c, __sim: score, __overlap: inter }));
}

function formatLevel(lv) {
  if (!lv) return "";
  const map = { junior: "Junior", mid: "Mid", senior: "Senior" };
  return map[lv] || lv;
}
