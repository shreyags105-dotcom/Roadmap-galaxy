import { describe, it, expect } from 'vitest';
import { learnNext } from '../src/lib/learnNext.js';

const topic = (rid, n, weight, level, prerequisites = []) => ({ topicId: `${rid}-${n}`, order: n, title: `${rid}${n}`, weight, level, prerequisites });
const A = { roadmapId: 'A', difficulty: 'Beginner', prerequisites: [], topics: [topic('A', 1, 3, 'Beginner'), topic('A', 2, 1, 'Beginner', ['A-1']), topic('A', 3, 3, 'Beginner')] };
const B = { roadmapId: 'B', difficulty: 'Intermediate', prerequisites: ['A'], topics: [topic('B', 1, 5, 'Intermediate')] };
const C = { roadmapId: 'C', difficulty: 'Advanced', prerequisites: [], topics: [topic('C', 1, 9, 'Advanced')] };
const roadmaps = [A, B, C];
const ids = (r) => r.map((x) => x.topicId);

describe('Learn Next', () => {
  it('Beginner: own level + one above, prerequisites enforced, weight desc then order asc', () => {
    const r = learnNext({ roadmaps, completed: [], studentLevel: 'Beginner' });
    expect(ids(r)).toEqual(['B-1', 'A-1', 'A-3']); // A-2 blocked by A-1, C-1 is two levels up
    expect(r.find((x) => x.topicId === 'B-1').stretch).toBe(true);
    expect(r.find((x) => x.topicId === 'A-1').stretch).toBe(false);
  });
  it('excludes completed topics and unlocks dependants', () => {
    const r = learnNext({ roadmaps, completed: ['A-1'], studentLevel: 'Beginner' });
    expect(ids(r)).toEqual(['B-1', 'A-3', 'A-2']);
  });
  it('a topic is hidden until ALL its prerequisites are complete', () => {
    const X = { roadmapId: 'X', difficulty: 'Beginner', prerequisites: [], topics: [topic('X', 1, 1, 'Beginner'), topic('X', 2, 1, 'Beginner'), topic('X', 3, 9, 'Beginner', ['X-1', 'X-2'])] };
    expect(ids(learnNext({ roadmaps: [X], completed: ['X-1'], studentLevel: 'Beginner' }))).toEqual(['X-2']);
    expect(ids(learnNext({ roadmaps: [X], completed: ['X-1', 'X-2'], studentLevel: 'Beginner' }))).toEqual(['X-3']);
  });
  it('Intermediate sees Intermediate + Advanced only (documented interpretation)', () => {
    expect(ids(learnNext({ roadmaps, completed: [], studentLevel: 'Intermediate' }))).toEqual(['C-1', 'B-1']);
  });
  it('ties on weight and order fall back to roadmap position', () => {
    const P = { roadmapId: 'P', difficulty: 'Beginner', prerequisites: [], topics: [topic('P', 1, 2, 'Beginner')] };
    const Q = { roadmapId: 'Q', difficulty: 'Beginner', prerequisites: [], topics: [topic('Q', 1, 2, 'Beginner')] };
    expect(ids(learnNext({ roadmaps: [Q, P], completed: [], studentLevel: 'Beginner' }))).toEqual(['Q-1', 'P-1']);
  });
  it('roadmap prerequisites are optional (off by default)', () => {
    const on = learnNext({ roadmaps, completed: [], studentLevel: 'Beginner', includeRoadmapPrerequisites: true });
    expect(ids(on)).toEqual(['A-1', 'A-3']);
  });
  it('honours limit and rejects unknown levels', () => {
    expect(learnNext({ roadmaps, completed: [], studentLevel: 'Beginner', limit: 1 })).toHaveLength(1);
    expect(() => learnNext({ roadmaps, completed: [], studentLevel: 'Expert' })).toThrow();
  });
});
