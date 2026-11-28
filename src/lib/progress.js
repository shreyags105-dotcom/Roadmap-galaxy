import { toSet } from './sets.js';

/** Weighted progress (0-100, NOT rounded): sum(weight of completed) / sum(weight of all) * 100. */
export function weightedProgress(topics, completed) {
  const done = toSet(completed);
  let total = 0;
  let earned = 0;
  for (const t of topics) {
    if (!Number.isFinite(t.weight) || t.weight < 0) throw new Error(`Invalid weight for topic ${t.topicId}`);
    total += t.weight;
    if (done.has(t.topicId)) earned += t.weight;
  }
  return total > 0 ? (100 * earned) / total : 0;
}

export const completedCount = (roadmap, completed) => {
  const done = toSet(completed);
  return roadmap.topics.filter((t) => done.has(t.topicId)).length;
};

/** Whole-number roadmap percentage (topic count based), as shown on roadmap cards. */
export const roadmapPercent = (roadmap, completed) =>
  Math.round((100 * completedCount(roadmap, completed)) / roadmap.topics.length);

/** Index of the first incomplete topic in a roadmap, or -1 when finished. */
export const nextTopicIndex = (roadmap, completed) => {
  const done = toSet(completed);
  return roadmap.topics.findIndex((t) => !done.has(t.topicId));
};

export const allTopics = (roadmaps) =>
  roadmaps.flatMap((r) => r.topics.map((t) => ({ ...t, roadmapId: r.roadmapId })));
