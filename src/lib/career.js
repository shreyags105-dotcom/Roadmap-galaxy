import { RULES } from '../config/rules.js';

const ALIASES = { completed: 'completed', learning: 'learning', in_progress: 'learning', not_started: 'not_started' };

export function normaliseStatus(status) {
  if (status == null) return 'not_started';
  if (!(status in ALIASES)) throw new Error(`Unknown requirement status: ${status}`);
  return ALIASES[status];
}

export function creditFor(status, rules = RULES.agreed.careerCompass) {
  const s = normaliseStatus(status);
  return s === 'completed' ? rules.completed : s === 'learning' ? rules.learning : rules.notStarted;
}

/**
 * Readiness = earned requirement weight / total requirement weight * 100.
 * completed = full weight, learning = half weight, not started = zero.
 * @param {{id:string, weight:number}[]} requirements
 * @param {Record<string,string>} statusById
 */
export function readiness(requirements, statusById) {
  let earned = 0;
  let total = 0;
  const items = requirements.map((req) => {
    if (!Number.isFinite(req.weight) || req.weight < 0) throw new Error(`Invalid weight for requirement ${req.id}`);
    const status = normaliseStatus(statusById[req.id]);
    const credit = req.weight * creditFor(status);
    earned += credit;
    total += req.weight;
    return { id: req.id, weight: req.weight, status, credit, missing: req.weight - credit };
  });
  return { percent: total > 0 ? (100 * earned) / total : 0, earned, total, items };
}

/** Requirements not yet fully earned, largest missing weight first (ties keep input order). */
export const skillGap = (requirements, statusById) =>
  readiness(requirements, statusById).items.filter((i) => i.missing > 0).sort((a, b) => b.missing - a.missing);
