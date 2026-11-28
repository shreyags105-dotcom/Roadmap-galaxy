import { RULES } from '../config/rules.js';
import { dayKey } from './dates.js';

export const FOCUS_PRESETS_MINUTES = RULES.agreed.focus.presetsMinutes;

export function assertPreset(minutes) {
  if (!FOCUS_PRESETS_MINUTES.includes(minutes)) throw new Error(`Focus preset must be one of ${FOCUS_PRESETS_MINUTES.join(', ')} minutes`);
  return minutes * 60;
}

// Timer maths derives everything from timestamps, never from counting ticks, so a throttled
// background tab or a page reload cannot make the timer drift.
export const elapsedSeconds = (startedAtMs, nowMs) => Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
export const remainingSeconds = (startedAtMs, plannedSeconds, nowMs) =>
  Math.max(0, plannedSeconds - elapsedSeconds(startedAtMs, nowMs));

/** Close a session (finished or stopped early). Actual time is capped at the planned time. */
export function finishSession({ startedAtMs, plannedSeconds, endedAtMs }) {
  const elapsed = elapsedSeconds(startedAtMs, endedAtMs);
  const actualSeconds = Math.min(elapsed, plannedSeconds);
  return { actualSeconds, status: elapsed >= plannedSeconds ? 'completed' : 'stopped_early' };
}

export const focusMinutes = (actualSeconds) => Math.floor(Math.max(0, actualSeconds) / 60);

/**
 * Award focus XP: 1 XP per whole minute, max 120 XP per calendar day (day = day the session started,
 * in the given time zone). Sessions are allocated in chronological order.
 * @param {{id:string, startedAtMs:number, actualSeconds:number}[]} sessions
 */
export function allocateFocusXp(sessions, { timeZone = 'UTC', rules = RULES.agreed.focus } = {}) {
  const used = new Map();
  return [...sessions]
    .sort((a, b) => a.startedAtMs - b.startedAtMs)
    .map((s) => {
      const day = dayKey(s.startedAtMs, timeZone);
      const minutes = focusMinutes(s.actualSeconds);
      const wanted = minutes * rules.xpPerMinute;
      const already = used.get(day) ?? 0;
      const xp = Math.max(0, Math.min(wanted, rules.dailyCapXp - already));
      used.set(day, already + xp);
      return { id: s.id, day, minutes, xp, capped: xp < wanted };
    });
}
