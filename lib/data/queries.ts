import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cardioSessions,
  userSettings,
  workoutSessions,
  workoutSets,
  workouts,
} from "@/lib/db/schema";
import { DEFAULT_WORKOUTS } from "@/lib/defaults";
import { DEFAULT_REST_SECONDS, clampRest } from "@/lib/rest";
import type { AppData } from "@/lib/schema";
import { normalizeCardioProfile, normalizeSchedule } from "@/lib/schema";
import {
  cardioFromRow,
  sessionFromRow,
  setFromRow,
  workoutFromRow,
  workoutToRow,
} from "./rows";

/**
 * Primeira visita da conta: cria a linha de ajustes e os treinos de exemplo.
 * Depois disso nunca mais, mesmo que a pessoa apague tudo.
 *
 * Tudo numa transação: se duas requisições chegam juntas na primeira visita,
 * a segunda espera a primeira terminar (a linha de ajustes ainda não gravada
 * trava o insert dela) e já encontra os treinos de exemplo ao ler.
 */
async function ensureAccountSetup(userId: string) {
  await db.transaction(async (tx) => {
    const created = await tx
      .insert(userSettings)
      .values({ userId, schedule: { days: [], rules: [] } })
      .onConflictDoNothing()
      .returning({ userId: userSettings.userId });
    if (created.length === 0) return;
    const now = Date.now();
    await tx
      .insert(workouts)
      .values(
        // um milissegundo de diferença mantém Push, Pull, Legs nessa ordem
        DEFAULT_WORKOUTS.map((w, i) => workoutToRow(userId, { ...w, createdAt: now - i })),
      )
      .onConflictDoNothing();
  });
}

/** Tudo o que o app usa, da pessoa logada, do mais novo para o mais antigo. */
export async function loadAppData(userId: string): Promise<AppData> {
  await ensureAccountSetup(userId);
  const [sets, workoutRows, sessions, cardio, settings] = await Promise.all([
    db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.userId, userId))
      .orderBy(desc(workoutSets.createdAt)),
    db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.createdAt)),
    db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startedAt)),
    db
      .select()
      .from(cardioSessions)
      .where(eq(cardioSessions.userId, userId))
      .orderBy(desc(cardioSessions.createdAt)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
  ]);
  const prefs = settings[0];
  return {
    sets: sets.map(setFromRow),
    workouts: workoutRows.map(workoutFromRow),
    sessions: sessions.map(sessionFromRow),
    cardioSessions: cardio.map(cardioFromRow),
    cardioProfile: normalizeCardioProfile(prefs?.cardioProfile),
    schedule: normalizeSchedule(prefs?.schedule),
    restSeconds:
      prefs?.restSeconds != null ? clampRest(prefs.restSeconds) : DEFAULT_REST_SECONDS,
  };
}
