import type {
  CardioProfile,
  CardioSession,
  Equipment,
  LoadType,
  Plan,
  RepeatRule,
  Schedule,
  ScheduledDay,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import { EQUIPMENT, LOAD_TYPES } from "@/types";
import { isDateKey } from "./dates";

/**
 * Runtime validation for everything that comes from outside the app's own
 * memory: whatever the browser sends to a Server Action.
 * Each normalizer returns a clean record, or null when it is unusable.
 */

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v : null;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const optStr = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s || undefined;
};

const loadType = (v: unknown): LoadType =>
  LOAD_TYPES.some((t) => t.value === v) ? (v as LoadType) : "weight";

const equipment = (v: unknown): Equipment | undefined =>
  EQUIPMENT.find((e) => e.value === v)?.value;

export function normalizeSet(v: unknown): WorkoutSet | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const exerciseId = str(v.exerciseId);
  const load = num(v.load);
  if (!id || !exerciseId || load === null || load < 0) return null;
  const reps = num(v.reps);
  return {
    id,
    exerciseId,
    sessionId: str(v.sessionId) ?? undefined,
    equipment: equipment(v.equipment),
    loadType: loadType(v.loadType),
    load,
    reps: reps !== null && reps >= 1 ? Math.round(reps) : 1,
    note: optStr(v.note),
    createdAt: num(v.createdAt) ?? Date.now(),
  };
}

export function normalizeWorkout(v: unknown): Workout | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const name = str(v.name)?.trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    exerciseIds: Array.isArray(v.exerciseIds)
      ? v.exerciseIds.filter((x): x is string => typeof x === "string")
      : [],
    createdAt: num(v.createdAt) ?? Date.now(),
  };
}

export function normalizeSession(v: unknown): WorkoutSession | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const startedAt = num(v.startedAt);
  if (!id || startedAt === null) return null;
  return {
    id,
    workoutId: str(v.workoutId),
    name: str(v.name)?.trim() ?? "Treino livre",
    startedAt,
    finishedAt: num(v.finishedAt),
    note: optStr(v.note),
  };
}

export function normalizeCardioSession(v: unknown): CardioSession | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const speedKmh = num(v.speedKmh);
  const inclinePct = num(v.inclinePct);
  const minutes = num(v.minutes);
  const weightKg = num(v.weightKg);
  const kcal = num(v.kcal);
  const avgHr = num(v.avgHr);
  if (
    !id ||
    speedKmh === null ||
    inclinePct === null ||
    minutes === null ||
    weightKg === null ||
    kcal === null ||
    avgHr === null
  )
    return null;
  return {
    id,
    createdAt: num(v.createdAt) ?? Date.now(),
    speedKmh,
    inclinePct,
    minutes,
    weightKg,
    kcal,
    avgHr,
  };
}

export function normalizeCardioProfile(v: unknown): CardioProfile | null {
  if (!isRecord(v)) return null;
  const weightKg = num(v.weightKg);
  const age = num(v.age);
  if (!weightKg || !age || (v.sex !== "male" && v.sex !== "female")) return null;
  return { weightKg, age, sex: v.sex };
}

const normalizePlan = (v: unknown): Plan | null => {
  if (!isRecord(v)) return null;
  if (v.type === "rest") return { type: "rest" };
  if (v.type === "none") return { type: "none" };
  const workoutId = str(v.workoutId);
  return v.type === "workout" && workoutId
    ? { type: "workout", workoutId }
    : null;
};

export function normalizeScheduledDay(v: unknown): ScheduledDay | null {
  if (!isRecord(v) || !isDateKey(v.date)) return null;
  const plan = normalizePlan(v.plan);
  return plan ? { date: v.date, plan } : null;
}

export function normalizeRepeatRule(v: unknown): RepeatRule | null {
  if (!isRecord(v)) return null;
  const id = str(v.id);
  const weekday = num(v.weekday);
  const plan = normalizePlan(v.plan);
  if (
    !id ||
    !plan ||
    !isDateKey(v.from) ||
    weekday === null ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  )
    return null;
  return { id, weekday, from: v.from, plan };
}

/** Accepts anything: a missing or broken schedule is just an empty one. */
export function normalizeSchedule(v: unknown): Schedule {
  if (!isRecord(v)) return { days: [], rules: [] };
  return {
    days: normalizeList(v.days, normalizeScheduledDay) ?? [],
    rules: normalizeList(v.rules, normalizeRepeatRule) ?? [],
  };
}

export function normalizeList<T>(
  raw: unknown,
  normalize: (v: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map(normalize).filter((x): x is T => x !== null);
}

/* ---------- App data ---------- */

/** Everything the app loads for the signed-in person. */
export type AppData = {
  sets: WorkoutSet[];
  workouts: Workout[];
  sessions: WorkoutSession[];
  cardioSessions: CardioSession[];
  cardioProfile: CardioProfile | null;
  schedule: Schedule;
  restSeconds: number;
};
