import { describe, it, expect } from 'vitest';
import { RULES } from '../src/config/rules.js';
import { topicXp, totalTopicXp, rankFor } from '../src/lib/xp.js';
import { computeStreak } from '../src/lib/streak.js';
import { roadmaps } from '../src/lib/catalogue.js';

describe('pending decisions stay visibly pending', () => {
  it('topic XP and rank tiers are flagged PENDING_DECISION', () => {
    expect(RULES.pending.topicXp.status).toBe('PENDING_DECISION');
    expect(RULES.pending.ranks.status).toBe('PENDING_DECISION');
  });
  it('agreed rules are exactly those that were specified', () => {
    expect(RULES.agreed.focus).toEqual({ xpPerMinute: 1, dailyCapXp: 120, presetsMinutes: [25, 45, 60] });
    expect(RULES.agreed.careerCompass).toEqual({ completed: 1, learning: 0.5, notStarted: 0 });
    expect(RULES.agreed.learnNext.levelsAbove).toBe(1);
  });
  it('every interpretation is documented with an id', () => {
    const ids = RULES.interpretations.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('leitner-interval-box');
  });
});

describe('XP and rank are configurable, not hard-coded', () => {
  it('accept an alternative mapping without code changes', () => {
    const alt = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    expect(topicXp('Advanced', alt)).toBe(3);
    expect(totalTopicXp(roadmaps, ['python-1', 'dsa-1'], alt)).toBe(1 + 2);
    expect(totalTopicXp(roadmaps, ['python-1', 'dsa-1'])).toBe(10 + 15);
  });
  it('rankFor uses supplied tiers', () => {
    const tiers = [{ name: 'A', minXp: 0 }, { name: 'B', minXp: 50 }];
    expect(rankFor(49, tiers)).toMatchObject({ name: 'A', xpToNext: 1 });
    expect(rankFor(50, tiers)).toMatchObject({ name: 'B', xpToNext: null });
  });
  it('unknown difficulty fails loudly', () => {
    expect(() => topicXp('Mystery')).toThrow();
  });
});

describe('streak', () => {
  const today = '2026-11-25';
  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-11-25', '2026-11-24', '2026-11-23'], today)).toBe(3);
  });
  it('stays alive if only yesterday is active; breaks after a gap', () => {
    expect(computeStreak(['2026-11-24'], today)).toBe(1);
    expect(computeStreak(['2026-11-23'], today)).toBe(0);
    expect(computeStreak(['2026-11-25', '2026-11-23'], today)).toBe(1);
  });
  it('empty and duplicates', () => {
    expect(computeStreak([], today)).toBe(0);
    expect(computeStreak(['2026-11-25', '2026-11-25'], today)).toBe(1);
  });
  it('crosses month boundaries', () => {
    expect(computeStreak(['2026-12-01', '2026-11-30', '2026-11-29'], '2026-12-01')).toBe(3);
  });
});
