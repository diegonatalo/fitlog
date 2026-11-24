import type { Schedule, WorkoutSession, WorkoutSet } from "@/types";
import { addDays, weekdayOf } from "./dates";
import { resolvePlan } from "./schedule";

const finishedOf = (sessions: WorkoutSession[], workoutId: string) =>
  sessions.filter((s) => s.workoutId === workoutId && s.finishedAt !== null);

/** Quantas vezes o treino foi feito até o fim. */
export function timesDone(sessions: WorkoutSession[], workoutId: string): number {
  return finishedOf(sessions, workoutId).length;
}

/** Duração média das sessões terminadas do treino, em minutos; null se nunca foi feito. */
export function averageMinutes(sessions: WorkoutSession[], workoutId: string): number | null {
  const done = finishedOf(sessions, workoutId);
  if (done.length === 0) return null;
  const total = done.reduce((sum, s) => sum + ((s.finishedAt as number) - s.startedAt), 0);
  return Math.max(1, Math.round(total / done.length / 60_000));
}

/** O próximo dia, a partir de hoje, em que o treino está na agenda (até `horizon` dias). */
export function nextPlannedDay(schedule: Schedule, workoutId: string, today: string, horizon = 14): string | null {
  for (let i = 0; i < horizon; i++) {
    const key = addDays(today, i);
    const plan = resolvePlan(schedule, key)?.plan;
    if (plan?.type === "workout" && plan.workoutId === workoutId) return key;
  }
  return null;
}

const WEEKDAY_CAP = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** "Hoje", "Amanhã" ou o dia da semana, para dizer quando o treino cai. */
export function dayName(key: string, today: string): string {
  if (key === today) return "Hoje";
  if (key === addDays(today, 1)) return "Amanhã";
  return WEEKDAY_CAP[weekdayOf(key)];
}

/** A regra semanal do treino, se houver: "Toda terça". */
export function weeklyLabel(schedule: Schedule, workoutId: string): string | null {
  const days = schedule.rules
    .filter((r) => r.plan.type === "workout" && r.plan.workoutId === workoutId)
    .map((r) => r.weekday)
    .sort((a, b) => a - b);
  if (days.length === 0) return null;
  const names = days.map((d) => WEEKDAY_CAP[d].toLowerCase());
  // sábado e domingo são masculinos: "Todo sábado", "Toda terça"
  const every = days[0] === 0 || days[0] === 6 ? "Todo" : "Toda";
  return `${every} ${new Intl.ListFormat("pt-BR", { type: "conjunction" }).format(names)}`;
}

/**
 * As séries do exercício na sessão anterior a `sessionId` (a mais recente das outras),
 * da primeira à última. `history` vem do mais novo para o mais antigo.
 */
export function previousSessionSets(history: WorkoutSet[], sessionId: string): WorkoutSet[] {
  const last = history.find((s) => s.sessionId && s.sessionId !== sessionId);
  if (!last) return [];
  return history.filter((s) => s.sessionId === last.sessionId).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * A letra que representa o treino no calendário: a última palavra quando ela é
 * uma letra ou número curto ("Treino A" → "A", "Treino 2" → "2"), senão a inicial ("Pernas" → "P").
 */
export function workoutInitial(name: string): string {
  const words = name.trim().split(/[\s·—-]+/).filter(Boolean);
  const tag = words.find((w, i) => i > 0 && /^[A-Za-z0-9]{1,2}$/.test(w));
  return (tag ?? words[0]?.[0] ?? "?").toUpperCase();
}
