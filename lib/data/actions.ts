"use server";

import { and, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
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
  normalizeList,
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
 */

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Entre de novo.");
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

export async function saveSet(input: unknown) {
  const userId = await requireUserId();
  const row = setToRow(userId, valid(normalizeSet(input)));
  await db
    .insert(workoutSets)
    .values(row)
    .onConflictDoUpdate({ target: [workoutSets.userId, workoutSets.id], set: row });
}

export async function deleteSet(id: unknown) {
  const userId = await requireUserId();
  await db
    .delete(workoutSets)
    .where(and(eq(workoutSets.userId, userId), eq(workoutSets.id, validId(id))));
}

/* ---------- Workouts ---------- */

export async function saveWorkout(input: unknown) {
  const userId = await requireUserId();
  const row = workoutToRow(userId, valid(normalizeWorkout(input)));
  await db
    .insert(workouts)
    .values(row)
    .onConflictDoUpdate({ target: [workouts.userId, workouts.id], set: row });
}

export async function deleteWorkout(id: unknown) {
  const userId = await requireUserId();
  await db
    .delete(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.id, validId(id))));
}

/* ---------- Sessions ---------- */

export async function saveSession(input: unknown) {
  const userId = await requireUserId();
  const row = sessionToRow(userId, valid(normalizeSession(input)));
  await db
    .insert(workoutSessions)
    .values(row)
    .onConflictDoUpdate({ target: [workoutSessions.userId, workoutSessions.id], set: row });
}

/** Apaga a sessão e as séries feitas nela. */
export async function deleteSession(id: unknown) {
  const userId = await requireUserId();
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

export async function saveCardioSession(input: unknown) {
  const userId = await requireUserId();
  const row = cardioToRow(userId, valid(normalizeCardioSession(input)));
  await db
    .insert(cardioSessions)
    .values(row)
    .onConflictDoUpdate({ target: [cardioSessions.userId, cardioSessions.id], set: row });
}

export async function deleteCardioSession(id: unknown) {
  const userId = await requireUserId();
  await db
    .delete(cardioSessions)
    .where(and(eq(cardioSessions.userId, userId), eq(cardioSessions.id, validId(id))));
}

/* ---------- Preferences ---------- */

export async function saveSchedule(input: unknown) {
  const userId = await requireUserId();
  await db
    .update(userSettings)
    .set({ schedule: normalizeSchedule(input) })
    .where(eq(userSettings.userId, userId));
}

export async function saveCardioProfile(input: unknown) {
  const userId = await requireUserId();
  await db
    .update(userSettings)
    .set({ cardioProfile: valid(normalizeCardioProfile(input)) })
    .where(eq(userSettings.userId, userId));
}

export async function saveRestSeconds(input: unknown) {
  const userId = await requireUserId();
  if (typeof input !== "number" || !Number.isFinite(input)) throw new Error("Dados inválidos.");
  await db
    .update(userSettings)
    .set({ restSeconds: clampRest(input) })
    .where(eq(userSettings.userId, userId));
}

/* ---------- Bulk ---------- */

/** O Postgres aceita até 65535 parâmetros por comando: insere em partes. */
const CHUNK = 1000;

async function insertChunked<T extends Record<string, unknown>>(
  tx: Pick<typeof db, "insert">,
  table: PgTable,
  rows: T[],
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await tx.insert(table).values(rows.slice(i, i + CHUNK));
  }
}

/** Um backup editado à mão pode repetir ids, o que quebraria a chave primária. */
const uniqueById = <T extends { id: string }>(list: T[]): T[] => [
  ...new Map(list.map((item) => [item.id, item])).values(),
];

/** Troca tudo o que a pessoa tem pelos dados recebidos (importar backup, apagar tudo). */
export async function replaceAllData(input: unknown) {
  const userId = await requireUserId();
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const sets = uniqueById(valid(normalizeList(raw.sets, normalizeSet)));
  const workoutList = uniqueById(valid(normalizeList(raw.workouts, normalizeWorkout)));
  const sessions = uniqueById(valid(normalizeList(raw.sessions, normalizeSession)));
  const cardio = uniqueById(valid(normalizeList(raw.cardioSessions, normalizeCardioSession)));
  const cardioProfile = normalizeCardioProfile(raw.cardioProfile);
  const schedule = normalizeSchedule(raw.schedule);

  await db.transaction(async (tx) => {
    for (const table of [workoutSets, workouts, workoutSessions, cardioSessions]) {
      await tx.delete(table).where(eq(table.userId, userId));
    }
    await insertChunked(tx, workoutSets, sets.map((s) => setToRow(userId, s)));
    await insertChunked(tx, workouts, workoutList.map((w) => workoutToRow(userId, w)));
    await insertChunked(tx, workoutSessions, sessions.map((s) => sessionToRow(userId, s)));
    await insertChunked(tx, cardioSessions, cardio.map((c) => cardioToRow(userId, c)));
    await tx
      .update(userSettings)
      .set({ cardioProfile, schedule })
      .where(eq(userSettings.userId, userId));
  });
}
