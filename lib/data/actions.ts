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
import { clampRest } from "@/lib/rest";
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
  sessionToRow,
  setToRow,
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

/* ---------- Sets ---------- */

export async function saveSet(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  const row = setToRow(userId, valid(normalizeSet(input)));
  await db
    .insert(workoutSets)
    .values(row)
    .onConflictDoUpdate({ target: [workoutSets.userId, workoutSets.id], set: row });
}

export async function deleteSet(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db
    .delete(workoutSets)
    .where(and(eq(workoutSets.userId, userId), eq(workoutSets.id, validId(id))));
}

/* ---------- Workouts ---------- */

export async function saveWorkout(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  const row = workoutToRow(userId, valid(normalizeWorkout(input)));
  await db
    .insert(workouts)
    .values(row)
    .onConflictDoUpdate({ target: [workouts.userId, workouts.id], set: row });
}

export async function deleteWorkout(owner: unknown, id: unknown) {
  const userId = await requireUserId(owner);
  await db
    .delete(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, validId(id))));
}

/* ---------- Sessions ---------- */

export async function saveSession(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  const row = sessionToRow(userId, valid(normalizeSession(input)));
  await db
    .insert(workoutSessions)
    .values(row)
    .onConflictDoUpdate({ target: [workoutSessions.userId, workoutSessions.id], set: row });
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

export async function saveSchedule(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  await db
    .update(userSettings)
    .set({ schedule: normalizeSchedule(input) })
    .where(eq(userSettings.userId, userId));
}

export async function saveCardioProfile(owner: unknown, input: unknown) {
  const userId = await requireUserId(owner);
  await db
    .update(userSettings)
    .set({ cardioProfile: valid(normalizeCardioProfile(input)) })
    .where(eq(userSettings.userId, userId));
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
