import { describe, expect, it } from "vitest";
import type { CardioSession, Workout, WorkoutSession, WorkoutSet } from "@/types";
import {
  cardioFromRow,
  cardioToRow,
  sessionFromRow,
  sessionToRow,
  setFromRow,
  setToRow,
  workoutFromRow,
  workoutToRow,
} from "./rows";

// Simula o que o banco devolve: a linha gravada, com as colunas opcionais em null.
const roundTrip = <T, R>(toRow: (userId: string, v: T) => R, fromRow: (r: never) => T, value: T) =>
  fromRow(toRow("u1", value) as never);

describe("séries", () => {
  it("vão e voltam iguais, com o dono na linha", () => {
    const set: WorkoutSet = {
      id: "s1",
      exerciseId: "ex-supino-reto",
      sessionId: "sess",
      equipment: "barbell",
      loadType: "weight",
      load: 42.5,
      reps: 8,
      note: "pegada fechada",
      createdAt: 1_700_000_000_000,
    };
    const row = setToRow("u1", set);
    expect(row).toMatchObject({ userId: "u1", createdAt: new Date(set.createdAt) });
    expect(roundTrip(setToRow, setFromRow, set)).toEqual(set);
  });

  it("campos opcionais vazios viram null no banco e somem na volta", () => {
    const set: WorkoutSet = { id: "s1", exerciseId: "e", loadType: "time", load: 10, reps: 1, createdAt: 1 };
    expect(setToRow("u1", set)).toMatchObject({ sessionId: null, equipment: null, note: null });
    expect(roundTrip(setToRow, setFromRow, set)).toEqual(set);
  });
});

describe("treinos", () => {
  it("vão e voltam iguais", () => {
    const workout: Workout = { id: "w", name: "Push", exerciseIds: ["a", "b"], createdAt: 5 };
    expect(roundTrip(workoutToRow, workoutFromRow, workout)).toEqual(workout);
  });
});

describe("sessões", () => {
  it("em andamento ficam com finishedAt null", () => {
    const session: WorkoutSession = { id: "x", workoutId: null, name: "Treino livre", startedAt: 10, finishedAt: null };
    expect(sessionToRow("u1", session).finishedAt).toBeNull();
    expect(roundTrip(sessionToRow, sessionFromRow, session)).toEqual(session);
  });

  it("finalizadas e com nota vão e voltam iguais", () => {
    const session: WorkoutSession = { id: "x", workoutId: "w", name: "Push", startedAt: 10, finishedAt: 20, note: "ok" };
    expect(roundTrip(sessionToRow, sessionFromRow, session)).toEqual(session);
  });
});

describe("cardio", () => {
  it("vai e volta igual", () => {
    const cardio: CardioSession = {
      id: "c",
      createdAt: 99,
      speedKmh: 6.5,
      inclinePct: 3,
      minutes: 30,
      weightKg: 72,
      kcal: 250,
      avgHr: 135,
    };
    expect(roundTrip(cardioToRow, cardioFromRow, cardio)).toEqual(cardio);
  });
});
