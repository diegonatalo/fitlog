import type { Plan, RepeatRule, Schedule } from "@/types";
import { weekdayOf } from "./dates";

export const EMPTY_SCHEDULE: Schedule = { days: [], rules: [] };

export type ResolvedPlan = {
  plan: Plan;
  /** a plan set for this exact date, or one that comes from a repeat rule */
  source: "day" | "rule";
};

/** The rule that applies to a date: the latest one started on or before it. */
function ruleFor(schedule: Schedule, key: string): RepeatRule | null {
  const weekday = weekdayOf(key);
  let found: RepeatRule | null = null;
  for (const r of schedule.rules) {
    if (r.weekday !== weekday || r.from > key) continue;
    if (!found || r.from > found.from) found = r;
  }
  return found;
}

/**
 * What is planned for a date, or null when nothing is. A plan set for the exact
 * date wins over a repeat rule, and "none" counts as nothing planned.
 */
export function resolvePlan(
  schedule: Schedule,
  key: string,
): ResolvedPlan | null {
  const day = schedule.days.find((d) => d.date === key);
  if (day) {
    return day.plan.type === "none" ? null : { plan: day.plan, source: "day" };
  }
  const rule = ruleFor(schedule, key);
  if (rule && rule.plan.type !== "none") {
    return { plan: rule.plan, source: "rule" };
  }
  return null;
}

const withoutDay = (schedule: Schedule, key: string): Schedule["days"] =>
  schedule.days.filter((d) => d.date !== key);

/** Plans a single date, leaving any repeat rule untouched. */
export function setDayPlan(
  schedule: Schedule,
  key: string,
  plan: Exclude<Plan, { type: "none" }>,
): Schedule {
  return {
    ...schedule,
    days: [...withoutDay(schedule, key), { date: key, plan }],
  };
}

/**
 * Empties a single date. When a repeat rule covers it, a "none" entry hides
 * that occurrence; otherwise the entry is just removed.
 */
export function clearDay(schedule: Schedule, key: string): Schedule {
  const days = withoutDay(schedule, key);
  const rule = ruleFor(schedule, key);
  if (rule && rule.plan.type !== "none") {
    return { ...schedule, days: [...days, { date: key, plan: { type: "none" } }] };
  }
  return { ...schedule, days };
}

/** Repeats a plan on this date's weekday, starting on this date. */
export function setRepeat(
  schedule: Schedule,
  key: string,
  plan: Exclude<Plan, { type: "none" }>,
  id: string,
): Schedule {
  return addRule(schedule, key, plan, id);
}

/** Ends the repeat on this date's weekday, starting on this date. */
export function stopRepeat(
  schedule: Schedule,
  key: string,
  id: string,
): Schedule {
  return addRule(schedule, key, { type: "none" }, id);
}

function addRule(
  schedule: Schedule,
  key: string,
  plan: Plan,
  id: string,
): Schedule {
  const weekday = weekdayOf(key);
  return {
    // the date itself now follows the rule
    days: withoutDay(schedule, key),
    rules: [
      ...schedule.rules.filter((r) => !(r.weekday === weekday && r.from === key)),
      { id, weekday, from: key, plan },
    ],
  };
}

/** Drops every plan that points at a deleted workout. */
export function removeWorkoutFromSchedule(
  schedule: Schedule,
  workoutId: string,
): Schedule {
  const points = (p: Plan) => p.type === "workout" && p.workoutId === workoutId;
  return {
    days: schedule.days.filter((d) => !points(d.plan)),
    rules: schedule.rules.map((r) =>
      points(r.plan) ? { ...r, plan: { type: "none" } } : r,
    ),
  };
}

/** Whether a repeat rule currently covers the date. */
export function isRepeating(schedule: Schedule, key: string): boolean {
  const rule = ruleFor(schedule, key);
  return rule !== null && rule.plan.type !== "none";
}
