import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_EXERCISES, DEFAULT_WORKOUTS } from "@/lib/defaults";
import {
  STORAGE_KEYS,
  loadCardioProfile,
  loadCardioSessions,
  loadExercises,
  loadSessions,
  loadSets,
  loadWorkouts,
  saveCardioProfile,
  saveExercises,
  saveSets,
  uid,
} from "@/lib/storage";
import type { WorkoutSet } from "@/types";

beforeEach(() => localStorage.clear());

describe("chaves de armazenamento", () => {
  it("seguem o formato app:nome:v1", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key).toMatch(/^fitlog:[a-z-]+:v1$/);
    }
  });
});

describe("loadExercises e loadWorkouts", () => {
  it("na primeira vez gravam e devolvem os padrões", () => {
    expect(loadExercises()).toEqual(DEFAULT_EXERCISES);
    expect(loadWorkouts()).toEqual(DEFAULT_WORKOUTS);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.exercises)!)).toHaveLength(
      DEFAULT_EXERCISES.length,
    );
  });

  it("leem o que foi salvo, sem voltar aos padrões", () => {
    saveExercises([{ id: "x", name: "Meu", muscleGroup: "abs", loadType: "weight", createdAt: 1 }]);
    expect(loadExercises().map((e) => e.id)).toEqual(["x"]);
  });

  it("descartam entradas corrompidas", () => {
    localStorage.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify([{ id: "x", name: "Ok" }, { id: "" }, 7]),
    );
    expect(loadExercises().map((e) => e.id)).toEqual(["x"]);
  });

  it("voltam aos padrões quando o JSON salvo está quebrado", () => {
    localStorage.setItem(STORAGE_KEYS.exercises, "{quebrado");
    expect(loadExercises()).toEqual(DEFAULT_EXERCISES);
  });
});

describe("listas sem padrão", () => {
  it("começam vazias", () => {
    expect(loadSets()).toEqual([]);
    expect(loadSessions()).toEqual([]);
    expect(loadCardioSessions()).toEqual([]);
    expect(loadCardioProfile()).toBeNull();
  });

  it("guardam e leem séries", () => {
    const sets: WorkoutSet[] = [
      { id: "s1", exerciseId: "e1", loadType: "weight", load: 40, reps: 10, createdAt: 1 },
    ];
    saveSets(sets);
    expect(loadSets()).toEqual(sets);
  });

  it("guardam e leem o perfil de cardio", () => {
    saveCardioProfile({ weightKg: 70, age: 30, sex: "male" });
    expect(loadCardioProfile()).toEqual({ weightKg: 70, age: 30, sex: "male" });
    saveCardioProfile(null);
    expect(loadCardioProfile()).toBeNull();
  });
});

describe("uid", () => {
  it("gera ids diferentes", () => {
    expect(new Set(Array.from({ length: 50 }, uid)).size).toBe(50);
  });
});
