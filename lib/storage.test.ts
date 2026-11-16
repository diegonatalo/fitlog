import { describe, expect, it } from "vitest";
import { DEFAULT_WORKOUTS } from "@/lib/defaults";
import {
  STORAGE_KEYS,
  parseCardioProfile,
  parseCardioSessions,
  parseRestSeconds,
  parseSessions,
  parseSets,
  parseWorkouts,
  uid,
} from "@/lib/storage";
import type { WorkoutSet } from "@/types";

describe("chaves de armazenamento", () => {
  it("seguem o formato <projeto>:<nome>:v1", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key).toMatch(/^fitlog:[a-z-]+:v1$/);
    }
  });
});

describe("parseWorkouts", () => {
  it("sem nada salvo ou com lixo, usa os treinos padrão", () => {
    expect(parseWorkouts(null)).toEqual(DEFAULT_WORKOUTS);
    expect(parseWorkouts("quebrado")).toEqual(DEFAULT_WORKOUTS);
  });

  it("usa o que foi salvo, sem voltar aos padrões", () => {
    expect(parseWorkouts([{ id: "w", name: "Meu", exerciseIds: [], createdAt: 1 }]).map((w) => w.id)).toEqual(["w"]);
  });
});

describe("listas sem padrão", () => {
  it("começam vazias", () => {
    expect(parseSets(null)).toEqual([]);
    expect(parseSessions(null)).toEqual([]);
    expect(parseCardioSessions(null)).toEqual([]);
    expect(parseCardioProfile(null)).toBeNull();
  });

  it("mantêm séries válidas e descartam as inválidas", () => {
    const set: WorkoutSet = { id: "s1", exerciseId: "e1", loadType: "weight", load: 40, reps: 10, createdAt: 1 };
    expect(parseSets([set, { id: 1 }])).toEqual([set]);
  });

  it("leem o perfil de cardio", () => {
    expect(parseCardioProfile({ weightKg: 70, age: 30, sex: "male" })).toEqual({ weightKg: 70, age: 30, sex: "male" });
  });
});

describe("tempo de descanso", () => {
  it("usa 90 s por padrão e ignora lixo", () => {
    expect(parseRestSeconds(null)).toBe(90);
    expect(parseRestSeconds("abc")).toBe(90);
  });

  it("limita valores fora do intervalo", () => {
    expect(parseRestSeconds(120)).toBe(120);
    expect(parseRestSeconds(99999)).toBe(600);
  });
});

describe("uid", () => {
  it("gera ids diferentes", () => {
    expect(new Set(Array.from({ length: 50 }, uid)).size).toBe(50);
  });
});
