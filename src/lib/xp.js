import { RULES } from '../config/rules.js';
import { toSet } from './sets.js';

// NOTE: the topic XP mapping and rank tiers are PENDING decisions (see config/rules.js).

export const topicXp = (difficulty, table = RULES.pending.topicXp.byDifficulty) => {
  if (!(difficulty in table)) throw new Error(`No XP defined for difficulty: ${difficulty}`);
  return table[difficulty];
};

export function totalTopicXp(roadmaps, completed, table = RULES.pending.topicXp.byDifficulty) {
  const done = toSet(completed);
  let xp = 0;
  for (const r of roadmaps) for (const t of r.topics) if (done.has(t.topicId)) xp += topicXp(t.level ?? r.difficulty, table);
  return xp;
}

export function rankFor(xp, tiers = RULES.pending.ranks.tiers) {
  let index = 0;
  tiers.forEach((tier, i) => { if (xp >= tier.minXp) index = i; });
  const next = tiers[index + 1] ?? null;
  return { name: tiers[index].name, index, next, xpToNext: next ? next.minXp - xp : null };
}
