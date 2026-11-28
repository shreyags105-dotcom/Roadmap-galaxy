import { RULES } from '../config/rules.js';
import { addDaysKey } from './dates.js';

const assertBox = (box, boxes) => {
  if (!Number.isInteger(box) || box < 1 || box > boxes) throw new Error(`Box must be an integer 1-${boxes}`);
};

export function newCard(id, todayKey) {
  return { id, box: 1, dueOn: todayKey, lastReviewedOn: null };
}

/**
 * Leitner review. Correct -> advance one box (max 5). Incorrect -> box 1, due tomorrow.
 * Next due = today + interval of the box the card moves into (1, 2, 4, 7, 14 days).
 */
export function reviewCard(card, correct, todayKey, rules = RULES.agreed.leitner) {
  assertBox(card.box, rules.boxes);
  const box = correct ? Math.min(card.box + 1, rules.boxes) : 1;
  return { ...card, box, dueOn: addDaysKey(todayKey, rules.intervalsDays[box - 1]), lastReviewedOn: todayKey };
}

export const isDue = (card, todayKey) => card.dueOn <= todayKey;

export const dueCards = (cards, todayKey) =>
  cards.filter((c) => isDue(c, todayKey)).sort((a, b) => a.dueOn.localeCompare(b.dueOn) || a.box - b.box);
