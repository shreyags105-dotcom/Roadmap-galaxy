import { addDaysKey } from './dates.js';

/**
 * Consecutive active days ending today. If today has no activity yet, the streak is still
 * alive when yesterday has activity (same behaviour as the prototype).
 */
export function computeStreak(activityDayKeys, todayKey) {
  const days = new Set(activityDayKeys);
  let cursor = days.has(todayKey) ? todayKey : addDaysKey(todayKey, -1);
  let n = 0;
  while (days.has(cursor)) { n += 1; cursor = addDaysKey(cursor, -1); }
  return n;
}
