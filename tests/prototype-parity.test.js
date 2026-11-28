// Compares the extracted modules with values produced by the ORIGINAL prototype running in a real
// browser (tests/fixtures/prototype-golden.json, made by scripts/generate-golden.py).
//
// Only rules that are EQUIVALENT are compared:
//  - roadmap %, completed counts, next topic, buildability, idea match score + ranking, roadmap recommendations,
//    streak, focus hours, XP + rank (under the same PENDING placeholder table), and the
//    weighted-progress FORMULA (fed the prototype's difficulty weights, because the prototype had no topic weights).
// Not compared: focus XP, Leitner, Career Compass, Learn Next (none of them existed in the prototype).
import { describe, it, expect } from 'vitest';
import golden from './fixtures/prototype-golden.json';
import { roadmaps, ideas, roadmapById } from '../src/lib/catalogue.js';
import { weightedProgress, roadmapPercent, completedCount, nextTopicIndex } from '../src/lib/progress.js';
import { totalTopicXp, rankFor, topicXp } from '../src/lib/xp.js';
import { computeStreak } from '../src/lib/streak.js';
import { buildability, ideaMatchScore, rankIdeas, recommendRoadmaps } from '../src/lib/recommend.js';

const allTopicsWithDifficultyWeight = roadmaps.flatMap((r) => r.topics.map((t) => ({ topicId: t.topicId, weight: topicXp(r.difficulty) })));

describe.each(Object.entries(golden.scenarios))('parity with prototype: %s', (name, sc) => {
  const completed = new Set(sc.input.done);
  const p = sc.prototype;

  it('per-roadmap percent, completed count and next topic', () => {
    for (const g of p.roadmaps) {
      const r = roadmapById.get(g.id);
      expect(roadmapPercent(r, completed), `${g.id} pct`).toBe(g.pct);
      expect(completedCount(r, completed), `${g.id} done`).toBe(g.done);
      expect(nextTopicIndex(r, completed), `${g.id} next`).toBe(g.next);
    }
  });

  it('weighted-progress formula equals the prototype when given the same weights', () => {
    expect(Math.round(weightedProgress(allTopicsWithDifficultyWeight, completed))).toBe(p.wprog.p);
    expect(completed.size).toBe(p.wprog.dn);
    expect(allTopicsWithDifficultyWeight.length).toBe(p.wprog.tn);
  });

  it('XP and rank match under the same pending placeholder table', () => {
    expect(totalTopicXp(roadmaps, completed)).toBe(p.xp);
    const rk = rankFor(p.xp);
    expect(rk.name).toBe(p.rankName);
    expect(rk.xpToNext).toBe(p.xpToNext);
  });

  it('streak and focus hours match', () => {
    const days = [...Object.values(sc.input.log), ...sc.input.focus.map((f) => f.d)];
    expect(computeStreak(days, golden.today)).toBe(p.streak);
    expect(sc.input.focus.reduce((a, f) => a + f.s, 0) / 3600).toBeCloseTo(p.focusHours, 10);
  });

  it('buildability matches for every idea', () => {
    for (const idea of ideas) {
      const b = buildability(idea, roadmapById, completed);
      const g = p.build[idea.ideaId];
      expect([b.done, b.total, b.percent]).toEqual([g.d, g.t, g.pct]);
    }
  });

  it.each(golden.interests)('match score, idea ranking and roadmap recommendations for interest "%s"', (interest) => {
    const g = p.byInterest[interest];
    for (const idea of ideas) {
      expect(ideaMatchScore(idea, roadmapById, completed, interest)).toBeCloseTo(g.scores[idea.ideaId], 12);
    }
    expect(rankIdeas(ideas, roadmapById, completed, interest).map((i) => i.ideaId)).toEqual(g.ranked);
    expect(recommendRoadmaps(roadmaps, completed, interest).map((r) => r.roadmapId)).toEqual(g.rec);
  });
});
