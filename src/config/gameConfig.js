export const PROFILE_KEY = 'english_buddy_profile_v2';

export const DEFAULT_PROFILE = {
  level: 1,
  xp: 0,
  sessionsCompleted: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  bestAccuracy: 0,
  lastSession: null,
  pet: { hunger: 65, happiness: 60 },
  food: { snack: 0, meal: 0, treat: 0 },
  lastRewards: null,
};

export const BUDDY_ACTION_DURATION_MS = {
  correct: 1700,
  feed: 2200,
};
