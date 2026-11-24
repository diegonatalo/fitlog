import type { WorkoutSession, WorkoutSet } from "@/types";
import { addDays, dateKey, weekdayOf } from "./dates";
import { recordIdsByExercise } from "./stats";

const dayOf = (ts: number) => dateKey(new Date(ts));

/** Domingo da semana de `key`, como na agenda. */
export const weekStart = (key: string) => addDays(key, -weekdayOf(key));

export type WeekVolume = { start: string; volume: number };

/**
 * Volume (kg × repetições das séries com peso) de cada uma das últimas `weeks`
 * semanas, da mais antiga à atual.
 */
export function weeklyVolume(sets: WorkoutSet[], today: string, weeks: number): WeekVolume[] {
  const current = weekStart(today);
  const result: WeekVolume[] = Array.from({ length: weeks }, (_, i) => ({
    start: addDays(current, -7 * (weeks - 1 - i)),
    volume: 0,
  }));
  const first = result[0].start;
  for (const s of sets) {
    if (s.loadType !== "weight") continue;
    const day = dayOf(s.createdAt);
    if (day < first || day > addDays(current, 6)) continue;
    const index = result.findIndex((w) => day >= w.start && day <= addDays(w.start, 6));
    if (index >= 0) result[index].volume += s.load * s.reps;
  }
  return result;
}

/** Variação da semana atual sobre a anterior, em %; null sem base de comparação. */
export function weekOverWeek(weeks: WeekVolume[]): number | null {
  if (weeks.length < 2) return null;
  const prev = weeks[weeks.length - 2].volume;
  const last = weeks[weeks.length - 1].volume;
  if (prev === 0) return null;
  return Math.round(((last - prev) / prev) * 100);
}

export type ConsistencyDay = { key: string; trained: boolean; future: boolean };

/** As últimas `weeks` semanas, uma coluna por semana, de domingo a sábado. */
export function consistencyGrid(trainedDays: ReadonlySet<string>, today: string, weeks: number): ConsistencyDay[][] {
  const current = weekStart(today);
  return Array.from({ length: weeks }, (_, w) => {
    const start = addDays(current, -7 * (weeks - 1 - w));
    return Array.from({ length: 7 }, (_, d) => {
      const key = addDays(start, d);
      return { key, trained: trainedDays.has(key), future: key > today };
    });
  });
}

/**
 * Semanas seguidas com pelo menos um treino, contando até a semana atual.
 * Uma semana atual ainda sem treino não quebra a sequência.
 */
export function weekStreak(trainedDays: ReadonlySet<string>, today: string): number {
  const weeks = new Set([...trainedDays].filter((d) => d <= today).map(weekStart));
  let start = weekStart(today);
  if (!weeks.has(start)) start = addDays(start, -7);
  let streak = 0;
  while (weeks.has(start)) {
    streak++;
    start = addDays(start, -7);
  }
  return streak;
}

/** Os recordes mais recentes, do mais novo ao mais antigo. */
export function recentRecords(sets: WorkoutSet[], limit: number): WorkoutSet[] {
  const records = recordIdsByExercise(sets);
  return sets
    .filter((s) => records.has(s.id))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

/**
 * A melhor marca anterior a um recorde: a série mais pesada do mesmo exercício
 * e do mesmo tipo de carga feita antes dele (na dúvida, a mais recente).
 */
export function previousBest(sets: WorkoutSet[], record: WorkoutSet): WorkoutSet | null {
  const kind = record.equipment ?? record.loadType;
  let best: WorkoutSet | null = null;
  for (const s of sets) {
    if (s.exerciseId !== record.exerciseId || (s.equipment ?? s.loadType) !== kind) continue;
    if (s.createdAt >= record.createdAt) continue;
    if (!best || s.load > best.load || (s.load === best.load && s.createdAt > best.createdAt)) best = s;
  }
  return best;
}

export type ConsistencySummary = { sessions: number; perWeek: number; averageMinutes: number | null };

/** Treinos terminados nas últimas `weeks` semanas (até hoje), a média por semana e a duração média. */
export function consistencySummary(sessions: WorkoutSession[], today: string, weeks: number): ConsistencySummary {
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  const done = sessions.filter((s) => {
    if (s.finishedAt === null) return false;
    const day = dayOf(s.startedAt);
    return day >= first && day <= today;
  });
  const minutes = done.map((s) => ((s.finishedAt as number) - s.startedAt) / 60_000);
  return {
    sessions: done.length,
    perWeek: Math.round((done.length / weeks) * 10) / 10,
    averageMinutes: minutes.length ? Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length) : null,
  };
}
