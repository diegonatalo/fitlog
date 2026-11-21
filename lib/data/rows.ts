import type {
  CardioSession,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import type {
  cardioSessions,
  workoutSessions,
  workoutSets,
  workouts,
} from "@/lib/db/schema";

/**
 * Conversion between the app's records (timestamps in ms, optional fields
 * absent) and database rows (Date columns, nullable fields, owner column).
 */

type SetRow = typeof workoutSets.$inferInsert;
type WorkoutRow = typeof workouts.$inferInsert;
type SessionRow = typeof workoutSessions.$inferInsert;
type CardioRow = typeof cardioSessions.$inferInsert;

const date = (ms: number) => new Date(ms);
const ms = (d: Date) => d.getTime();

export const setToRow = (userId: string, s: WorkoutSet): SetRow => ({
  userId,
  id: s.id,
  exerciseId: s.exerciseId,
  sessionId: s.sessionId ?? null,
  equipment: s.equipment ?? null,
  loadType: s.loadType,
  load: s.load,
  reps: s.reps,
  note: s.note ?? null,
  createdAt: date(s.createdAt),
});

export const setFromRow = (r: typeof workoutSets.$inferSelect): WorkoutSet => ({
  id: r.id,
  exerciseId: r.exerciseId,
  ...(r.sessionId ? { sessionId: r.sessionId } : {}),
  ...(r.equipment ? { equipment: r.equipment } : {}),
  loadType: r.loadType,
  load: r.load,
  reps: r.reps,
  ...(r.note ? { note: r.note } : {}),
  createdAt: ms(r.createdAt),
});

export const workoutToRow = (userId: string, w: Workout): WorkoutRow => ({
  userId,
  id: w.id,
  name: w.name,
  exerciseIds: w.exerciseIds,
  createdAt: date(w.createdAt),
});

export const workoutFromRow = (r: typeof workouts.$inferSelect): Workout => ({
  id: r.id,
  name: r.name,
  exerciseIds: r.exerciseIds,
  createdAt: ms(r.createdAt),
});

export const sessionToRow = (userId: string, s: WorkoutSession): SessionRow => ({
  userId,
  id: s.id,
  workoutId: s.workoutId,
  name: s.name,
  startedAt: date(s.startedAt),
  finishedAt: s.finishedAt === null ? null : date(s.finishedAt),
  note: s.note ?? null,
});

export const sessionFromRow = (
  r: typeof workoutSessions.$inferSelect,
): WorkoutSession => ({
  id: r.id,
  workoutId: r.workoutId,
  name: r.name,
  startedAt: ms(r.startedAt),
  finishedAt: r.finishedAt ? ms(r.finishedAt) : null,
  ...(r.note ? { note: r.note } : {}),
});

export const cardioToRow = (userId: string, c: CardioSession): CardioRow => ({
  userId,
  ...c,
  createdAt: date(c.createdAt),
});

export const cardioFromRow = (
  r: typeof cardioSessions.$inferSelect,
): CardioSession => ({
  id: r.id,
  createdAt: ms(r.createdAt),
  speedKmh: r.speedKmh,
  inclinePct: r.inclinePct,
  minutes: r.minutes,
  weightKg: r.weightKg,
  kcal: r.kcal,
  avgHr: r.avgHr,
});
