import type {
  CardioProfile,
  CardioSession,
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
} as const;

export const THEME_KEY = "fitlog:theme:v1";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

/** Reads a list, dropping invalid entries; null when absent or not a list. */
function readList<T>(
  key: string,
  normalize: (v: unknown) => T | null,
): T[] | null {
  return normalizeList(readJson(key), normalize);
}

/* ---------- Loaders / savers ---------- */

export function loadSets(): WorkoutSet[] {
  return readList(STORAGE_KEYS.sets, normalizeSet) ?? [];
}

export function saveSets(sets: WorkoutSet[]) {
  write(STORAGE_KEYS.sets, sets);
}

export function loadWorkouts(): Workout[] {
  const list = readList(STORAGE_KEYS.workouts, normalizeWorkout);
  if (list) return list;
  write(STORAGE_KEYS.workouts, DEFAULT_WORKOUTS);
  return DEFAULT_WORKOUTS;
}

export function saveWorkouts(workouts: Workout[]) {
  write(STORAGE_KEYS.workouts, workouts);
}

export function loadSessions(): WorkoutSession[] {
  return readList(STORAGE_KEYS.sessions, normalizeSession) ?? [];
}

export function saveSessions(sessions: WorkoutSession[]) {
  write(STORAGE_KEYS.sessions, sessions);
}

export function loadCardioSessions(): CardioSession[] {
  return readList(STORAGE_KEYS.cardioSessions, normalizeCardioSession) ?? [];
}

export function saveCardioSessions(sessions: CardioSession[]) {
  write(STORAGE_KEYS.cardioSessions, sessions);
}

export function loadCardioProfile(): CardioProfile | null {
  return normalizeCardioProfile(readJson(STORAGE_KEYS.cardioProfile));
}

export function saveCardioProfile(profile: CardioProfile | null) {
  write(STORAGE_KEYS.cardioProfile, profile);
}

export function loadRestSeconds(): number {
  const raw = readJson(STORAGE_KEYS.restSeconds);
  return typeof raw === "number" ? clampRest(raw) : DEFAULT_REST_SECONDS;
}

export function saveRestSeconds(seconds: number) {
  write(STORAGE_KEYS.restSeconds, clampRest(seconds));
}
