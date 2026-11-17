import type { ThemeColors } from "@/lib/theme";
import type {
  CardioProfile,
  CardioSession,
  Schedule,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import { DEFAULT_WORKOUTS } from "./defaults";
import { DEFAULT_REST_SECONDS, clampRest } from "./rest";
import {
  normalizeCardioProfile,
  normalizeCardioSession,
  normalizeList,
  normalizeSchedule,
  normalizeSession,
  normalizeSet,
  normalizeWorkout,
} from "./schema";

export const STORAGE_KEYS = {
  sets: "fitlog:sets:v1",
  workouts: "fitlog:workouts:v1",
  sessions: "fitlog:sessions:v1",
  cardioSessions: "fitlog:cardio-sessions:v1",
  cardioProfile: "fitlog:cardio-profile:v1",
  restSeconds: "fitlog:rest-seconds:v1",
  schedule: "fitlog:schedule:v1",
} as const;

export const THEME_KEY = "fitlog:theme:v1";

/** Cor da barra do navegador em cada tema (fundo do app). */
export const THEME_COLORS: ThemeColors = { dark: "#14161d", light: "#f4f6f9" };

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- Parsers ----------
 * Pure: they turn whatever was read from storage (already JSON-parsed, or null)
 * into valid data. Reading and writing localStorage lives in usePersistedState.
 */

const list = <T>(raw: unknown, normalize: (v: unknown) => T | null): T[] =>
  normalizeList(raw, normalize) ?? [];

export const parseSets = (raw: unknown): WorkoutSet[] => list(raw, normalizeSet);

/** Missing or broken workouts fall back to the sample workouts. */
export const parseWorkouts = (raw: unknown): Workout[] =>
  normalizeList(raw, normalizeWorkout) ?? DEFAULT_WORKOUTS;

export const parseSessions = (raw: unknown): WorkoutSession[] => list(raw, normalizeSession);

export const parseCardioSessions = (raw: unknown): CardioSession[] =>
  list(raw, normalizeCardioSession);

export const parseCardioProfile = (raw: unknown): CardioProfile | null =>
  normalizeCardioProfile(raw);

export const parseRestSeconds = (raw: unknown): number =>
  typeof raw === "number" ? clampRest(raw) : DEFAULT_REST_SECONDS;

export const parseSchedule = (raw: unknown): Schedule => normalizeSchedule(raw);
