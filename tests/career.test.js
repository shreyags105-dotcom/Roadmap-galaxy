import { describe, it, expect } from 'vitest';
import { readiness, skillGap, creditFor } from '../src/lib/career.js';

const reqs = [{ id: 'r1', weight: 3 }, { id: 'r2', weight: 1 }, { id: 'r3', weight: 2 }];

describe('Career Compass readiness', () => {
  it('credit: completed = full, learning = half, not started = zero', () => {
    expect(creditFor('completed')).toBe(1);
    expect(creditFor('learning')).toBe(0.5);
    expect(creditFor('not_started')).toBe(0);
    expect(creditFor(undefined)).toBe(0);
    expect(creditFor('in_progress')).toBe(0.5);
  });
  it('readiness = earned / total * 100', () => {
    const r = readiness(reqs, { r1: 'completed', r2: 'learning' });
    expect(r.earned).toBe(3.5);
    expect(r.total).toBe(6);
    expect(r.percent).toBeCloseTo(58.3333333, 6);
  });
  it('0% when nothing started, 100% when everything completed, 0 for no requirements', () => {
    expect(readiness(reqs, {}).percent).toBe(0);
    expect(readiness(reqs, { r1: 'completed', r2: 'completed', r3: 'completed' }).percent).toBe(100);
    expect(readiness([], {}).percent).toBe(0);
  });
  it('rejects unknown statuses and bad weights', () => {
    expect(() => readiness(reqs, { r1: 'done' })).toThrow();
    expect(() => readiness([{ id: 'x', weight: -1 }], {})).toThrow();
  });
  it('skill gap lists missing weight, largest first', () => {
    const gap = skillGap(reqs, { r1: 'learning', r2: 'completed' });
    expect(gap.map((g) => [g.id, g.missing])).toEqual([['r3', 2], ['r1', 1.5]]);
  });
});
