import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { CardioProfile, Equipment, LoadType, Schedule } from "@/types";

/* ---------- Better Auth ----------
 * Tables and columns follow the core schema Better Auth expects.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/**
 * Tentativas de login e cadastro por IP. No banco, e não na memória, para o
 * limite valer entre todas as instâncias do servidor na Vercel.
 */
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/* ---------- FitLog ----------
 * Ids are generated in the browser (`uid`), so every key is (user_id, id):
 * one person can never write over a row of another, whatever id they send.
 */

const owner = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

const at = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const workouts = pgTable(
  "workouts",
  {
    userId: owner(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    exerciseIds: jsonb("exercise_ids").$type<string[]>().notNull(),
    createdAt: at("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const workoutSessions = pgTable(
  "workout_sessions",
  {
    userId: owner(),
    id: text("id").notNull(),
    /** no foreign key: a deleted workout keeps its past sessions */
    workoutId: text("workout_id"),
    name: text("name").notNull(),
    startedAt: at("started_at").notNull(),
    finishedAt: at("finished_at"),
    note: text("note"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const workoutSets = pgTable(
  "workout_sets",
  {
    userId: owner(),
    id: text("id").notNull(),
    exerciseId: text("exercise_id").notNull(),
    sessionId: text("session_id"),
    equipment: text("equipment").$type<Equipment>(),
    loadType: text("load_type").$type<LoadType>().notNull(),
    load: doublePrecision("load").notNull(),
    reps: integer("reps").notNull(),
    note: text("note"),
    createdAt: at("created_at").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("workout_sets_session_idx").on(t.userId, t.sessionId),
  ],
);

export const cardioSessions = pgTable(
  "cardio_sessions",
  {
    userId: owner(),
    id: text("id").notNull(),
    createdAt: at("created_at").notNull(),
    speedKmh: doublePrecision("speed_kmh").notNull(),
    inclinePct: doublePrecision("incline_pct").notNull(),
    minutes: doublePrecision("minutes").notNull(),
    weightKg: doublePrecision("weight_kg").notNull(),
    kcal: doublePrecision("kcal").notNull(),
    avgHr: doublePrecision("avg_hr").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

/** One row per person, created on the first visit together with the sample workouts. */
export const userSettings = pgTable("user_settings", {
  userId: owner().primaryKey(),
  restSeconds: integer("rest_seconds"),
  cardioProfile: jsonb("cardio_profile").$type<CardioProfile>(),
  schedule: jsonb("schedule").$type<Schedule>().notNull(),
});
