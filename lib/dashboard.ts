import type { MuscleGroup, WorkoutSession, WorkoutSet } from "@/types";
import { addDays, dateKey } from "./dates";
import { recordIdsByExercise } from "./stats";

export type DashboardStats = {
  sessions7: number;
  sessions30: number;
  /** kg × reps of free-weight sets in the last 7 days */
  volume7: number;
  /** sets in the last 30 days that beat every earlier set of that exercise and equipment */
  records30: number;
  /** average length of finished sessions in the last 30 days, in minutes */
  avgMinutes: number | null;
  /** sets per muscle group in the last 30 days, most trained first */
  muscles30: { group: MuscleGroup; sets: number }[];
};

const dayOf = (ts: number) => dateKey(new Date(ts));

/**
 * Numbers for the home screen. `today` is a "YYYY-MM-DD" key, so the windows
 * are whole calendar days ("last 7 days" includes today).
 */
export function dashboardStats(
  sessions: WorkoutSession[],
  sets: WorkoutSet[],
  today: string,
  groupOf: (exerciseId: string) => MuscleGroup | undefined,
): DashboardStats {
  const from7 = addDays(today, -6);
  const from30 = addDays(today, -29);
  const within = (ts: number, from: string) => {
    const day = dayOf(ts);
    return day >= from && day <= today;
  };

  const finished = sessions.filter((s) => s.finishedAt !== null);
  const sessions7 = finished.filter((s) => within(s.startedAt, from7)).length;
  const recent = finished.filter((s) => within(s.startedAt, from30));

  const volume7 = sets
    .filter((s) => s.loadType === "weight" && within(s.createdAt, from7))
    .reduce((sum, s) => sum + s.load * s.reps, 0);

  const records = recordIdsByExercise(sets);
  const records30 = sets.filter(
    (s) => records.has(s.id) && within(s.createdAt, from30),
  ).length;

  const minutes = recent.map(
    (s) => ((s.finishedAt as number) - s.startedAt) / 60_000,
  );
  const avgMinutes = minutes.length
    ? Math.max(1, Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length))
    : null;

  const perGroup = new Map<MuscleGroup, number>();
  for (const s of sets) {
    if (!within(s.createdAt, from30)) continue;
    const group = groupOf(s.exerciseId);
    if (group) perGroup.set(group, (perGroup.get(group) ?? 0) + 1);
  }
  const muscles30 = [...perGroup.entries()]
    .map(([group, count]) => ({ group, sets: count }))
    .sort((a, b) => b.sets - a.sets);

  return {
    sessions7,
    sessions30: recent.length,
    volume7: Math.round(volume7),
    records30,
    avgMinutes,
    muscles30,
  };
}
