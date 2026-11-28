import { RULES } from '../config/rules.js';
import { roadmapPercent, completedCount } from './progress.js';

/** Dashboard roadmap suggestions: matching interest, not finished, most progress first. */
export const recommendRoadmaps = (roadmaps, completed, interest, limit = 3) =>
  roadmaps
    .filter((r) => r.careerInterests.includes(interest) && roadmapPercent(r, completed) < 100)
    .sort((a, b) => roadmapPercent(b, completed) - roadmapPercent(a, completed) || a.difficulty.localeCompare(b.difficulty))
    .slice(0, limit);

/** Buildability = completed topics / total topics across the roadmaps an idea needs. */
export function buildability(idea, roadmapsById, completed) {
  let done = 0;
  let total = 0;
  for (const id of idea.requiredRoadmaps) {
    const r = roadmapsById.get(id);
    done += completedCount(r, completed);
    total += r.topics.length;
  }
  return { done, total, percent: total ? Math.round((100 * done) / total) : 0 };
}

/** Prototype "Match" score (0-1): 70% skills + 30% interest. Carried over, not part of the written spec. */
export function ideaMatchScore(idea, roadmapsById, completed, interest, w = RULES.carriedOver.ideaMatch) {
  const skills =
    idea.requiredRoadmaps.reduce((s, id) => s + roadmapPercent(roadmapsById.get(id), completed), 0) /
    idea.requiredRoadmaps.length / 100;
  return skills * w.skills + (idea.interests.includes(interest) ? w.interest : 0);
}

export const rankIdeas = (ideas, roadmapsById, completed, interest) =>
  [...ideas].sort((a, b) => ideaMatchScore(b, roadmapsById, completed, interest) - ideaMatchScore(a, roadmapsById, completed, interest));
