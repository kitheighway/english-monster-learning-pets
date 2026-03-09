import { DEFAULT_PROFILE, PROFILE_KEY } from '../config/gameConfig.js';

export function loadProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      pet: { ...DEFAULT_PROFILE.pet, ...(parsed.pet || {}) },
      food: { ...DEFAULT_PROFILE.food, ...(parsed.food || {}) },
    };
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage failures.
  }
}
