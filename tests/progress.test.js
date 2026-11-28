import { describe, it, expect } from 'vitest';
import { weightedProgress, roadmapPercent, nextTopicIndex } from '../src/lib/progress.js';
import { roadmaps } from '../src/lib/catalogue.js';

const T = (topicId, weight) => ({ topicId, weight });

describe('weightedProgress = sum(completed weight) / sum(all weight) * 100', () => {
  const topics = [T('a', 2), T('b', 1), T('c', 1)];
  it('weights matter', () => {
    expect(weightedProgress(topics, ['a'])).toBe(50);
    expect(weightedProgress(topics, ['b', 'c'])).toBe(50);
    expect(weightedProgress(topics, ['b'])).toBe(25);
  });
  it('boundaries', () => {
    expect(weightedProgress(topics, [])).toBe(0);
    expect(weightedProgress(topics, ['a', 'b', 'c'])).toBe(100);
    expect(weightedProgress([], ['a'])).toBe(0);
  });
  it('ignores unknown IDs and accepts a Set', () => {
    expect(weightedProgress(topics, new Set(['a', 'zzz']))).toBe(50);
  });
  it('is not rounded', () => {
    expect(weightedProgress([T('a', 1), T('b', 2)], ['a'])).toBeCloseTo(33.3333333, 6);
  });
  it('rejects invalid weights', () => {
    expect(() => weightedProgress([T('a', -1)], [])).toThrow();
    expect(() => weightedProgress([T('a', NaN)], [])).toThrow();
  });
  it('with the real (equal-weight) catalogue it equals the plain topic ratio', () => {
    const topics = roadmaps.flatMap((r) => r.topics);
    expect(weightedProgress(topics, ['python-1', 'python-2'])).toBeCloseTo((100 * 2) / 132, 10);
  });
});

describe('roadmap helpers', () => {
  const py = roadmaps.find((r) => r.roadmapId === 'python');
  it('roadmapPercent rounds to a whole number', () => {
    expect(roadmapPercent(py, ['python-1'])).toBe(10);
    expect(roadmapPercent(py, [])).toBe(0);
  });
  it('nextTopicIndex finds the first gap, or -1 when complete', () => {
    expect(nextTopicIndex(py, ['python-1', 'python-3'])).toBe(1);
    expect(nextTopicIndex(py, py.topics.map((t) => t.topicId))).toBe(-1);
  });
});
