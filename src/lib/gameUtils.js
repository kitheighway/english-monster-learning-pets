import { clamp01to100 } from './math.js';

export function xpToLevel(level) {
  return Math.round(80 + (level - 1) * 20);
}

export function applyXp(profile, xpEarned) {
  let { level, xp } = profile;
  xp += xpEarned;

  while (xp >= xpToLevel(level)) {
    xp -= xpToLevel(level);
    level += 1;
  }

  return { ...profile, level, xp };
}

export function shuffle(array) {
  const next = [...array];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

export function safeMode(question) {
  return question?.mode || 'English';
}

export function safeHint(question) {
  return (
    question?.hint ||
    'Tip: re-read carefully and think about the rule being tested.'
  );
}

export function safeExplanation(question) {
  return (
    question?.explanation ||
    'Add an explanation in questions.js so learners understand why.'
  );
}

export function makeLevelUpRewards(levelsGained) {
  const snack = 1 + Math.floor(levelsGained / 2);
  const meal = levelsGained >= 2 ? 1 : 0;
  const treat = levelsGained >= 3 ? 1 : 0;

  return { snack, meal, treat };
}

export function addFood(food, rewards) {
  return {
    snack: (food?.snack || 0) + (rewards?.snack || 0),
    meal: (food?.meal || 0) + (rewards?.meal || 0),
    treat: (food?.treat || 0) + (rewards?.treat || 0),
  };
}

export function hasAnyFood(food) {
  return (food?.snack || 0) + (food?.meal || 0) + (food?.treat || 0) > 0;
}

export function applyBuddyFeed(profile, foodType) {
  const next = {
    ...profile,
    pet: { ...profile.pet },
    food: { ...profile.food },
  };

  if (foodType === 'snack' && (next.food.snack || 0) > 0) {
    next.food.snack -= 1;
    next.pet.hunger = clamp01to100((next.pet.hunger ?? 60) + 18);
    next.pet.happiness = clamp01to100((next.pet.happiness ?? 60) + 6);
  }

  if (foodType === 'meal' && (next.food.meal || 0) > 0) {
    next.food.meal -= 1;
    next.pet.hunger = clamp01to100((next.pet.hunger ?? 60) + 30);
    next.pet.happiness = clamp01to100((next.pet.happiness ?? 60) + 10);
  }

  if (foodType === 'treat' && (next.food.treat || 0) > 0) {
    next.food.treat -= 1;
    next.pet.hunger = clamp01to100((next.pet.hunger ?? 60) + 10);
    next.pet.happiness = clamp01to100((next.pet.happiness ?? 60) + 22);
  }

  return next;
}
