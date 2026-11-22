import type { CardioProfile, Plan, Schedule, Workout, WorkoutSession, WorkoutSet } from "@/types";
import { LIMITS } from "@/lib/schema";
import { CONFLICT, mergeList, mergeRecord, pick, same } from "@/lib/three-way";

/** `conflict`: another device changed the same thing, and nothing was saved. */
export type SaveResult = "saved" | "conflict";

export const mergeSet = mergeRecord<WorkoutSet>;

export const mergeProfile = mergeRecord<CardioProfile>;

/** The exercise list merges item by item, so two devices can each add one. */
export const mergeWorkout = (base: Workout | undefined, next: Workout, current: Workout | undefined): Workout | null => {
  if (!base || !current) return mergeRecord(base, next, current);
  const exerciseIds = mergeList(base.exerciseIds, next.exerciseIds, current.exerciseIds, (id) => id, (_, id) => id);
  // two valid edits together can pass the limit, and cutting would lose one
  if (!exerciseIds || exerciseIds.length > LIMITS.exercisesPerWorkout) return null;
  const rest = mergeRecord({ ...base, exerciseIds: [] }, { ...next, exerciseIds: [] }, { ...current, exerciseIds: [] });
  return rest && { ...rest, exerciseIds };
};

/** Finishing what the other device already finished keeps the first time. */
export const mergeSession = (
  base: WorkoutSession | undefined,
  next: WorkoutSession,
  current: WorkoutSession | undefined,
): WorkoutSession | null => {
  const finishedByBoth = base?.finishedAt === null && next.finishedAt !== null && current?.finishedAt != null;
  return mergeRecord(base, finishedByBoth ? { ...next, finishedAt: current.finishedAt } : next, current);
};

/** An entry is its place in the calendar, and its value is the plan (setting it again makes a new id). */
const mergePlanned = <T extends { plan: Plan }>(base: T | undefined, next: T, current: T | undefined): T | null => {
  if (!current) return base ? null : next;
  if (!base) return same(next.plan, current.plan) ? current : null;
  const plan = pick(base.plan, next.plan, current.plan);
  return plan === CONFLICT ? null : { ...current, plan };
};

/** Merges by date, and by weekday and start for the repeats. */
export const mergeSchedule = (base: Schedule, next: Schedule, current: Schedule): Schedule | null => {
  const days = mergeList(base.days, next.days, current.days, (day) => day.date, mergePlanned);
  const rules = mergeList(base.rules, next.rules, current.rules, (rule) => `${rule.weekday}|${rule.from}`, mergePlanned);
  return days && rules && { days, rules };
};
