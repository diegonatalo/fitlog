import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_WORKOUTS } from "@/lib/defaults";
import {
  STORAGE_KEYS,
  loadCardioProfile,
  loadCardioSessions,
  loadSessions,
  loadSets,
  loadWorkouts,
  saveCardioProfile,
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

describe("loadWorkouts", () => {
  it("na primeira vez grava e devolve os treinos padrão", () => {
    expect(loadWorkouts()).toEqual(DEFAULT_WORKOUTS);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.workouts)!)).toHaveLength(
      DEFAULT_WORKOUTS.length,
    );
  });

  it("lê o que foi salvo, sem voltar aos padrões", () => {
    localStorage.setItem(
      STORAGE_KEYS.workouts,
      JSON.stringify([{ id: "w", name: "Meu", exerciseIds: [], createdAt: 1 }]),
    );
    expect(loadWorkouts().map((w) => w.id)).toEqual(["w"]);
  });

  it("volta aos padrões quando o JSON salvo está quebrado", () => {
    localStorage.setItem(STORAGE_KEYS.workouts, "{quebrado");
    expect(loadWorkouts()).toEqual(DEFAULT_WORKOUTS);
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
