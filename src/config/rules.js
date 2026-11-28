// ============================================================================
// Roadmap Galaxy rules: the ONLY place where numbers/thresholds live.
//
//   agreed       -> rules confirmed in earlier planning.
//   pending      -> NOT approved. Placeholders so the app can run. Do not treat as requirements.
//   carriedOver  -> logic that exists in the prototype but was never part of the written spec.
//   interpretations -> places where the agreed wording left a detail open; the choice made is
//                      listed so it can be confirmed or changed in one place.
// ============================================================================

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const RULES = {
  agreed: {
    // Weighted progress = sum(weight of completed topics) / sum(weight of all topics) * 100
    focus: { xpPerMinute: 1, dailyCapXp: 120, presetsMinutes: [25, 45, 60] },
    leitner: { boxes: 5, intervalsDays: [1, 2, 4, 7, 14] },
    careerCompass: { completed: 1, learning: 0.5, notStarted: 0 },
    learnNext: { levelsAbove: 1 },
  },

  pending: {
    topicXp: {
      status: 'PENDING_DECISION',
      note: 'Topic-completion XP mapping has not been specified. These values are a placeholder carried over from the prototype.',
      byDifficulty: { Beginner: 10, Intermediate: 15, Advanced: 20 },
    },
    ranks: {
      status: 'PENDING_DECISION',
      note: 'Rank names and XP thresholds have not been specified. Placeholder carried over from the prototype.',
      tiers: [
        { name: 'Cadet', minXp: 0 },
        { name: 'Navigator', minXp: 100 },
        { name: 'Pilot', minXp: 300 },
        { name: 'Commander', minXp: 700 },
        { name: 'Admiral', minXp: 1500 },
      ],
    },
  },

  carriedOver: {
    // Prototype hackathon "Match" score: 70% skills + 30% interest. Not from the written spec.
    ideaMatch: { skills: 0.7, interest: 0.3 },
  },

  interpretations: [
    { id: 'focus-minute-rounding', rule: 'Focus XP counts whole completed minutes (floor of seconds / 60).' },
    { id: 'focus-day-attribution', rule: 'A focus session counts towards the calendar day (user time zone) in which it STARTED.' },
    { id: 'focus-early-stop-xp', rule: 'An early-stopped session earns XP for the whole minutes actually focused.' },
    { id: 'focus-actual-cap', rule: 'Actual focus time is capped at the planned duration.' },
    { id: 'learn-next-level-window', rule: 'Learn Next allows topic levels in [studentLevel, studentLevel + 1] only; lower levels are excluded. Option levelsAbove is configurable.' },
    { id: 'learn-next-order-tiebreak', rule: 'Sort: weight DESC, then topic order ASC, then roadmap catalogue position ASC.' },
    { id: 'learn-next-roadmap-prereqs', rule: 'Roadmap-level prerequisites are advisory (as in the prototype); enabling them is an option, off by default.' },
    { id: 'leitner-interval-box', rule: 'After a review, the next due date uses the interval of the box the card moves INTO (box 2 -> 2 days). Wrong answer -> box 1 -> 1 day (tomorrow).' },
    { id: 'leitner-new-card', rule: 'A new card starts in box 1 and is due on the day it is created.' },
    { id: 'leitner-calendar-days', rule: 'Due dates are calendar dates (YYYY-MM-DD) in the user time zone, not 24-hour offsets.' },
    { id: 'topic-weight-default', rule: 'Every topic weight is 1 until real topic weightage is supplied in src/data/roadmaps.json.' },
    { id: 'topic-level-default', rule: 'Topic level equals its roadmap difficulty until topic-level data is supplied.' },
  ],
};
