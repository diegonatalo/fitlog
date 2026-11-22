import { describe, expect, it } from "vitest";
import { mergeProfile, mergeSchedule, mergeSession, mergeSet, mergeWorkout } from "@/lib/merge";
import { LIMITS } from "@/lib/schema";
import type { Schedule, Workout, WorkoutSession, WorkoutSet } from "@/types";

const workout: Workout = { id: "w", name: "Push", exerciseIds: ["a", "b"], createdAt: 1 };
const session: WorkoutSession = { id: "s", workoutId: "w", name: "Push", startedAt: 1, finishedAt: null };
const empty: Schedule = { days: [], rules: [] };
const rest = { type: "rest" } as const;
const planned = (id: string) => ({ type: "workout", workoutId: id }) as const;

describe("mergeWorkout", () => {
  it("junta o nome de um e os exercícios do outro", () => {
    const merged = mergeWorkout(workout, { ...workout, exerciseIds: ["a", "b", "c"] }, { ...workout, name: "Peito" });
    expect(merged).toEqual({ ...workout, name: "Peito", exerciseIds: ["a", "b", "c"] });
  });

  it("o exercício que cada um incluiu fica", () => {
    const merged = mergeWorkout(workout, { ...workout, exerciseIds: ["a", "x", "b"] }, { ...workout, exerciseIds: ["a", "b", "y"] });
    expect(merged?.exerciseIds).toEqual(["a", "x", "b", "y"]);
  });

  it("nomes diferentes e treino apagado são conflito", () => {
    expect(mergeWorkout(workout, { ...workout, name: "X" }, { ...workout, name: "Y" })).toBeNull();
    expect(mergeWorkout(workout, { ...workout, name: "X" }, undefined)).toBeNull();
  });

  it("não corta em silêncio quando a soma passa do limite", () => {
    const many = (prefix: string) => Array.from({ length: LIMITS.exercisesPerWorkout }, (_, i) => `${prefix}${i}`);
    const base = { ...workout, exerciseIds: [] };
    expect(mergeWorkout(base, { ...base, exerciseIds: many("x") }, { ...base, exerciseIds: many("y") })).toBeNull();
  });
});

describe("mergeSet", () => {
  const set: WorkoutSet = { id: "1", exerciseId: "a", loadType: "weight", load: 60, reps: 10, createdAt: 1 };

  it("junta a carga de um e as repetições do outro", () => {
    expect(mergeSet(set, { ...set, reps: 8 }, { ...set, load: 72.5 })).toEqual({ ...set, reps: 8, load: 72.5 });
  });
});

describe("mergeSession", () => {
  it("uma anotação não reabre o treino que o outro finalizou", () => {
    const merged = mergeSession(session, { ...session, note: "bom" }, { ...session, finishedAt: 50 });
    expect(merged).toEqual({ ...session, note: "bom", finishedAt: 50 });
  });

  it("finalizar nos dois fica com o primeiro horário", () => {
    expect(mergeSession(session, { ...session, finishedAt: 90 }, { ...session, finishedAt: 50 })?.finishedAt).toBe(50);
  });
});

describe("mergeSchedule", () => {
  it("cada aparelho planeja um dia e os dois ficam", () => {
    const mine = { ...empty, days: [{ date: "2026-11-10", plan: rest }] };
    const theirs = { ...empty, days: [{ date: "2026-11-11", plan: rest }] };
    expect(mergeSchedule(empty, mine, theirs)?.days).toHaveLength(2);
  });

  it("planos diferentes no mesmo dia são conflito, o mesmo não", () => {
    const day = (plan: Schedule["days"][number]["plan"]) => ({ ...empty, days: [{ date: "2026-11-10", plan }] });
    expect(mergeSchedule(empty, day(rest), day(planned("w")))).toBeNull();
    expect(mergeSchedule(empty, day(rest), day(rest))?.days).toHaveLength(1);
  });

  it("a mesma repetição criada nos dois não duplica, mesmo com id diferente", () => {
    const rule = (id: string) => ({ ...empty, rules: [{ id, weekday: 2, from: "2026-11-10", plan: rest }] });
    expect(mergeSchedule(empty, rule("meu"), rule("dele"))?.rules).toEqual(rule("dele").rules);
  });
});

describe("mergeProfile", () => {
  const profile = { weightKg: 80, age: 30, sex: "male" } as const;

  it("junta o peso de um e a idade do outro", () => {
    expect(mergeProfile(profile, { ...profile, weightKg: 78 }, { ...profile, age: 31 })).toEqual({ ...profile, weightKg: 78, age: 31 });
  });
});
