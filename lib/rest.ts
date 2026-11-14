export const DEFAULT_REST_SECONDS = 90;
export const MIN_REST_SECONDS = 15;
export const MAX_REST_SECONDS = 600;
export const REST_STEP_SECONDS = 15;
export const REST_PRESETS = [60, 90, 120, 180];

/** Keeps a rest duration a whole number of seconds inside the allowed range. */
export function clampRest(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_REST_SECONDS;
  return Math.min(
    MAX_REST_SECONDS,
    Math.max(MIN_REST_SECONDS, Math.round(seconds)),
  );
}
