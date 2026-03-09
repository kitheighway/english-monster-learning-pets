export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clamp01to100(value) {
  return clamp(value, 0, 100);
}
