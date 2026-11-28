import { LEVELS, RULES } from '../config/rules.js';
import { toSet } from './sets.js';

export const levelIndex = (level) => {
  const i = LEVELS.indexOf(level);
  if (i < 0) throw new Error(`Unknown level: ${level}`);
  return i;
};

/**
 * Learn Next:
 *  - excludes completed topics
 *  - requires every topic prerequisite to be completed
 *  - allows topics at the student's level and `levelsAbove` above (a stretch)
 *  - sorts by weight DESC, then topic order ASC (then roadmap position ASC)
 */
export function learnNext({
  roadmaps, completed, studentLevel, limit = 10,
  levelsAbove = RULES.agreed.learnNext.levelsAbove,
  includeRoadmapPrerequisites = false,
}) {
  const done = toSet(completed);
  const s = levelIndex(studentLevel);
  const byId = new Map(roadmaps.map((r) => [r.roadmapId, r]));
  const roadmapComplete = (id) => { const r = byId.get(id); return !!r && r.topics.every((t) => done.has(t.topicId)); };

  const out = [];
  roadmaps.forEach((r, roadmapIndex) => {
    if (includeRoadmapPrerequisites && !r.prerequisites.every(roadmapComplete)) return;
    for (const t of r.topics) {
      if (done.has(t.topicId)) continue;
      if (!(t.prerequisites ?? []).every((p) => done.has(p))) continue;
      const li = levelIndex(t.level ?? r.difficulty);
      if (li < s || li > s + levelsAbove) continue;
      out.push({ topicId: t.topicId, roadmapId: r.roadmapId, title: t.title, weight: t.weight, order: t.order, level: LEVELS[li], stretch: li > s, roadmapIndex });
    }
  });
  out.sort((a, b) => b.weight - a.weight || a.order - b.order || a.roadmapIndex - b.roadmapIndex);
  return out.slice(0, limit);
}
