import { describe, it, expect } from 'vitest';
import { newCard, reviewCard, isDue, dueCards } from '../src/lib/leitner.js';
import { RULES } from '../src/config/rules.js';

const TODAY = '2026-11-25';

describe('Leitner boxes 1-5, intervals 1, 2, 4, 7, 14 days', () => {
  it('uses the agreed intervals', () => {
    expect(RULES.agreed.leitner.intervalsDays).toEqual([1, 2, 4, 7, 14]);
    expect(RULES.agreed.leitner.boxes).toBe(5);
  });
  it('a new card starts in box 1, due today', () => {
    expect(newCard('c1', TODAY)).toMatchObject({ box: 1, dueOn: TODAY });
  });
  it('a correct answer advances exactly one box and schedules by the new box', () => {
    let c = newCard('c1', TODAY);
    const seen = [];
    for (let i = 0; i < 5; i++) { c = reviewCard(c, true, TODAY); seen.push([c.box, c.dueOn]); }
    expect(seen).toEqual([[2, '2026-11-27'], [3, '2026-11-29'], [4, '2026-12-02'], [5, '2026-12-09'], [5, '2026-12-09']]);
  });
  it('an incorrect answer returns to box 1, due tomorrow, from any box', () => {
    for (const box of [1, 2, 3, 4, 5]) {
      expect(reviewCard({ id: 'x', box, dueOn: TODAY }, false, TODAY)).toMatchObject({ box: 1, dueOn: '2026-11-26' });
    }
  });
  it('handles month and year boundaries', () => {
    expect(reviewCard({ id: 'x', box: 2, dueOn: '2026-12-30' }, true, '2026-12-30').dueOn).toBe('2027-01-03');
    expect(reviewCard({ id: 'x', box: 5, dueOn: '2027-02-20' }, false, '2027-02-28').dueOn).toBe('2027-03-01');
  });
  it('rejects invalid boxes', () => {
    expect(() => reviewCard({ id: 'x', box: 0, dueOn: TODAY }, true, TODAY)).toThrow();
    expect(() => reviewCard({ id: 'x', box: 6, dueOn: TODAY }, true, TODAY)).toThrow();
  });
  it('due cards: due today or earlier, oldest first then lowest box', () => {
    const cards = [
      { id: 'a', box: 3, dueOn: '2026-11-25' }, { id: 'b', box: 1, dueOn: '2026-11-24' },
      { id: 'c', box: 2, dueOn: '2026-11-26' }, { id: 'd', box: 1, dueOn: '2026-11-25' },
    ];
    expect(isDue(cards[2], TODAY)).toBe(false);
    expect(dueCards(cards, TODAY).map((c) => c.id)).toEqual(['b', 'd', 'a']);
  });
});
