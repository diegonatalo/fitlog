"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cardioSessions,
  userSettings,
  workoutSessions,
  workoutSets,
  workouts,
} from "@/lib/db/schema";
import {
  mergeProfile,
  mergeSchedule,
  mergeSession,
  mergeSet,
  mergeWorkout,
  type SaveResult,
} from "@/lib/merge";
import { clampRest } from "@/lib/rest";
import { removeWorkoutFromSchedule } from "@/lib/schedule";
import {
  normalizeCardioProfile,
  normalizeCardioSession,
  normalizeSchedule,
  normalizeSession,
  normalizeSet,
  normalizeWorkout,
} from "@/lib/schema";
import { getCurrentUser } from "@/lib/session";
import {
  cardioToRow,
  sessionFromRow,
  sessionToRow,
  setFromRow,
  setToRow,
  workoutFromRow,
  workoutToRow,
} from "./rows";

/*
 * Cada ação confere a sessão de novo e valida o que chegou: elas são endpoints
 * públicos, e o navegador pode mandar qualquer coisa. Toda escrita é limitada
 * às linhas da própria pessoa (user_id).
 *
 * O primeiro argumento é a conta para a qual a tela foi carregada. Ele não dá
 * acesso a nada: só faz a ação recusar quando outra conta entrou em outra aba,
 * em vez de gravar os dados de uma pessoa na conta da outra.
 *
 * Quem edita manda também como estava antes: só o que mudou é aplicado, e uma
 * tela desatualizada não desfaz o que outro aparelho salvou (lib/merge.ts).
 */

async function requireUserId(owner: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Entre de novo.");
  if (user.id !== owner) throw new Error("Outra conta entrou neste navegador.");
  return user.id;
}

function valid<T>(value: T | null): T {
  if (value === null) throw new Error("Dados inválidos.");
  return value;
}

function validId(id: unknown): string {
  if (typeof id !== "string" || !id) throw new Error("Dados inválidos.");
  return id;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Settings = typeof userSettings.$inferSelect;

/**
 * Trava os ajustes da conta até o fim: os salvamentos de uma conta passam um por
 * vez, e nada muda entre ler o que está salvo e gravar.
 */
function withAccountLock<T>(userId: string, run: (tx: Tx, settings: Settings | undefined) => Promise<T>) {
  return db.transaction(async (tx) => {
    const [settings] = await tx.select().from(userSettings).where(eq(userSettings.userId, userId)).for("update");
    return run(tx, settings);
  });
}

/** Como estava antes da edição; ausente para o que é novo. */
function previous<T>(input: unknown, normalize: (value: unknown) => T | null): T | undefined {
  return input === undefined || input === null ? undefined : valid(normalize(input));
}

/* ---------- Sets ---------- */

export async function saveSet(owner: unknown, input: unknown, before?: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  const next = valid(normalizeSet(input));
  const base = previous(before, normalizeSet);
  return withAccountLock(userId, async (tx) => {
    const [saved] = await tx
      .select()
      .from(workoutSets)
      .where(and(eq(workoutSets.userId, userId), eq(workoutSets.id, next.id)));
    const merged = mergeSet(base, next, saved && valid(normalizeSet(setFromRow(saved))));
    if (!merged) return "conflict";
    const row = setToRow(userId, merged);
    await tx
      .insert(workoutSets)
      .values(row)
      .onConflictDoUpdate({ target: [workoutSets.userId, workoutSets.id], set: row });
    return "saved";
  });
}

export async function deleteSet(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db
    .delete(workoutSets)
    .where(and(eq(workoutSets.userId, userId), eq(workoutSets.id, validId(id))));
}

/* ---------- Workouts ---------- */

export async function saveWorkout(owner: unknown, input: unknown, before?: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  const next = valid(normalizeWorkout(input));
  const base = previous(before, normalizeWorkout);
  return withAccountLock(userId, async (tx) => {
    const [saved] = await tx
      .select()
      .from(workouts)
      .where(and(eq(workouts.userId, userId), eq(workouts.id, next.id)));
    const merged = mergeWorkout(base, next, saved && valid(normalizeWorkout(workoutFromRow(saved))));
    if (!merged) return "conflict";
    const row = workoutToRow(userId, merged);
    await tx
      .insert(workouts)
      .values(row)
      .onConflictDoUpdate({ target: [workouts.userId, workouts.id], set: row });
    return "saved";
  });
}

/** Apaga o treino e tira da agenda salva, que pode ser mais nova que a da tela. */
export async function deleteWorkout(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  const workoutId = validId(id);
  await withAccountLock(userId, async (tx, settings) => {
    await tx.delete(workouts).where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)));
    if (!settings) return;
    const schedule = removeWorkoutFromSchedule(normalizeSchedule(settings.schedule), workoutId);
    await tx.update(userSettings).set({ schedule }).where(eq(userSettings.userId, userId));
  });
}

/* ---------- Sessions ---------- */

export async function saveSession(owner: unknown, input: unknown, before?: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  const next = valid(normalizeSession(input));
  const base = previous(before, normalizeSession);
  return withAccountLock(userId, async (tx) => {
    const [saved] = await tx
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.id, next.id)));
    const merged = mergeSession(base, next, saved && valid(normalizeSession(sessionFromRow(saved))));
    if (!merged) return "conflict";
    const row = sessionToRow(userId, merged);
    await tx
      .insert(workoutSessions)
      .values(row)
      .onConflictDoUpdate({ target: [workoutSessions.userId, workoutSessions.id], set: row });
    return "saved";
  });
}

/** Apaga a sessão e as séries feitas nela. */
export async function deleteSession(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  const sessionId = validId(id);
  await db.transaction(async (tx) => {
    await tx
      .delete(workoutSets)
      .where(and(eq(workoutSets.userId, userId), eq(workoutSets.sessionId, sessionId)));
    await tx
      .delete(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.id, sessionId)));
  });
}

/* ---------- Cardio ---------- */

export async function saveCardioSession(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  const row = cardioToRow(userId, valid(normalizeCardioSession(input)));
  await db
    .insert(cardioSessions)
    .values(row)
    .onConflictDoUpdate({ target: [cardioSessions.userId, cardioSessions.id], set: row });
}

export async function deleteCardioSession(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db
    .delete(cardioSessions)
    .where(and(eq(cardioSessions.userId, userId), eq(cardioSessions.id, validId(id))));
}

/* ---------- Preferences ---------- */

export async function saveSchedule(owner: unknown, input: unknown, before?: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  // sem o "antes" (aba de uma versão antiga), não dá para saber o que mudou
  if (before === undefined) return "conflict";
  const [base, next] = [normalizeSchedule(before), normalizeSchedule(input)];
  return withAccountLock(userId, async (tx, settings) => {
    const schedule = settings && mergeSchedule(base, next, normalizeSchedule(settings.schedule));
    if (!schedule) return "conflict";
    await tx
      .update(userSettings)
      .set({ schedule: normalizeSchedule(schedule) })
      .where(eq(userSettings.userId, userId));
    return "saved";
  });
}

export async function saveCardioProfile(owner: unknown, input: unknown, before?: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  const next = valid(normalizeCardioProfile(input));
  const base = previous(before, normalizeCardioProfile);
  return withAccountLock(userId, async (tx, settings) => {
    const cardioProfile = mergeProfile(base, next, normalizeCardioProfile(settings?.cardioProfile) ?? undefined);
    if (!cardioProfile) return "conflict";
    await tx.update(userSettings).set({ cardioProfile }).where(eq(userSettings.userId, userId));
    return "saved";
  });
}

export async function saveRestSeconds(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  if (typeof input !== "number" || !Number.isFinite(input)) throw new Error("Dados inválidos.");
  await db
    .update(userSettings)
    .set({ restSeconds: clampRest(input) })
    .where(eq(userSettings.userId, userId));
}

/* ---------- Bulk ---------- */

/** "Apagar todos os dados": limpa os registros e mantém a conta e o descanso. */
export async function clearAllData(owner: unknown) {
  const userId = await requireUserId(owner);
  await db.transaction(async (tx) => {
    for (const table of [workoutSets, workouts, workoutSessions, cardioSessions]) {
      await tx.delete(table).where(eq(table.userId, userId));
    }
    await tx
      .update(userSettings)
      .set({ cardioProfile: null, schedule: { days: [], rules: [] } })
      .where(eq(userSettings.userId, userId));
  });
}
