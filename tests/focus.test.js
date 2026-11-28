import { describe, it, expect } from 'vitest';
import { FOCUS_PRESETS_MINUTES, assertPreset, elapsedSeconds, remainingSeconds, finishSession, focusMinutes, allocateFocusXp } from '../src/lib/focus.js';

const T0 = Date.parse('2026-11-25T10:00:00Z');
const MIN = 60_000;

describe('presets', () => {
  it('are exactly 25, 45 and 60 minutes', () => {
    expect(FOCUS_PRESETS_MINUTES).toEqual([25, 45, 60]);
    expect(assertPreset(45)).toBe(2700);
    expect(() => assertPreset(30)).toThrow();
  });
});

describe('timestamp-based timer', () => {
  it('derives time from timestamps only (no tick counting)', () => {
    expect(elapsedSeconds(T0, T0 + 90_500)).toBe(90);
    expect(remainingSeconds(T0, 1500, T0 + 10 * MIN)).toBe(900);
    // simulates a tab that was asleep / page reloaded for 20 minutes: still exact
    expect(remainingSeconds(T0, 1500, T0 + 20 * MIN)).toBe(300);
  });
  it('never negative, even with clock skew or after the end', () => {
    expect(elapsedSeconds(T0, T0 - 5000)).toBe(0);
    expect(remainingSeconds(T0, 1500, T0 + 99 * MIN)).toBe(0);
  });
});

describe('finishing a session', () => {
  it('early stop records actual time and status', () => {
    const s = finishSession({ startedAtMs: T0, plannedSeconds: 1500, endedAtMs: T0 + 10 * MIN + 30_000 });
    expect(s).toEqual({ actualSeconds: 630, status: 'stopped_early' });
    expect(focusMinutes(s.actualSeconds)).toBe(10);
  });
  it('completed sessions are capped at the planned time', () => {
    expect(finishSession({ startedAtMs: T0, plannedSeconds: 1500, endedAtMs: T0 + 40 * MIN })).toEqual({ actualSeconds: 1500, status: 'completed' });
  });
  it('only whole minutes count', () => {
    expect(focusMinutes(59)).toBe(0);
    expect(focusMinutes(60)).toBe(1);
    expect(focusMinutes(-5)).toBe(0);
  });
});

describe('Focus XP: 1 XP per minute, max 120 per calendar day', () => {
  const S = (id, startIso, minutes) => ({ id, startedAtMs: Date.parse(startIso), actualSeconds: minutes * 60 });
  it('awards 1 XP per focused minute', () => {
    expect(allocateFocusXp([S('a', '2026-11-25T09:00:00Z', 25)])[0]).toMatchObject({ minutes: 25, xp: 25, capped: false });
  });
  it('caps a day at 120 XP', () => {
    const r = allocateFocusXp([S('a', '2026-11-25T08:00:00Z', 60), S('b', '2026-11-25T10:00:00Z', 60), S('c', '2026-11-25T12:00:00Z', 60)]);
    expect(r.map((x) => x.xp)).toEqual([60, 60, 0]);
    expect(r[2].capped).toBe(true);
  });
  it('partially awards the session that crosses the cap', () => {
    const r = allocateFocusXp([S('a', '2026-11-25T08:00:00Z', 60), S('b', '2026-11-25T10:00:00Z', 60), S('c', '2026-11-25T12:00:00Z', 45)]);
    expect(r.map((x) => x.xp)).toEqual([60, 60, 0]);
    const r2 = allocateFocusXp([S('a', '2026-11-25T08:00:00Z', 100), S('b', '2026-11-25T11:00:00Z', 45)]);
    expect(r2.map((x) => x.xp)).toEqual([100, 20]);
  });
  it('resets on the next calendar day', () => {
    const r = allocateFocusXp([S('a', '2026-11-25T08:00:00Z', 120), S('b', '2026-11-26T08:00:00Z', 60)]);
    expect(r.map((x) => x.xp)).toEqual([120, 60]);
  });
  it('the calendar day follows the user time zone', () => {
    const late = S('a', '2026-11-25T23:00:00Z', 60);
    const early = S('b', '2026-11-26T00:30:00Z', 100);
    expect(allocateFocusXp([late, early], { timeZone: 'UTC' }).map((x) => x.xp)).toEqual([60, 100]);
    // In India (UTC+5:30) both start on 26 Nov, so the 120 cap applies across both.
    expect(allocateFocusXp([late, early], { timeZone: 'Asia/Kolkata' }).map((x) => x.xp)).toEqual([60, 60]);
  });
  it('is order independent (sorts chronologically)', () => {
    const a = S('a', '2026-11-25T08:00:00Z', 100);
    const b = S('b', '2026-11-25T11:00:00Z', 45);
    expect(allocateFocusXp([b, a]).map((x) => [x.id, x.xp])).toEqual([['a', 100], ['b', 20]]);
  });
});
