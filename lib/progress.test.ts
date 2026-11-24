import { describe, expect, it } from "vitest";
import type { WorkoutSet } from "@/types";
import {
  consistencyGrid,
  recentRecords,
  weekOverWeek,
  weekStart,
  weekStreak,
  weeklyVolume,
} from "@/lib/progress";

// 2026-11-24 é uma terça; a semana começa no domingo, 22
const TODAY = "2026-11-24";
const at = (key: string, hour = 10) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, hour).getTime();
};

let seq = 0;
const set = (day: string, load: number, reps: number, patch: Partial<WorkoutSet> = {}): WorkoutSet => ({
  id: `t${seq++}`,
  exerciseId: "ex-supino-reto",
  loadType: "weight",
  load,
  reps,
  createdAt: at(day),
  ...patch,
});

describe("weekStart", () => {
  it("volta para o domingo da semana", () => {
    expect(weekStart(TODAY)).toBe("2026-11-22");
    expect(weekStart("2026-11-22")).toBe("2026-11-22");
    expect(weekStart("2026-11-28")).toBe("2026-11-22");
  });
});

describe("weeklyVolume", () => {
  it("soma kg × repetições por semana, da mais antiga à atual", () => {
    const sets = [
      set("2026-11-23", 60, 10), // semana atual
      set("2026-11-24", 50, 10),
      set("2026-11-21", 40, 10), // sábado da semana anterior
      set("2026-11-01", 100, 1), // fora da janela de 3 semanas
      set("2026-11-24", 5, 30, { loadType: "plates" }), // sem peso em kg
    ];
    expect(weeklyVolume(sets, TODAY, 3)).toEqual([
      { start: "2026-11-08", volume: 0 },
      { start: "2026-11-15", volume: 400 },
      { start: "2026-11-22", volume: 1100 },
    ]);
  });
});

describe("weekOverWeek", () => {
  it("compara a semana atual com a anterior", () => {
    expect(weekOverWeek([{ start: "a", volume: 1000 }, { start: "b", volume: 1100 }])).toBe(10);
    expect(weekOverWeek([{ start: "a", volume: 1000 }, { start: "b", volume: 500 }])).toBe(-50);
  });

  it("sem semana anterior com volume, não há comparação", () => {
    expect(weekOverWeek([{ start: "a", volume: 0 }, { start: "b", volume: 500 }])).toBeNull();
    expect(weekOverWeek([{ start: "b", volume: 500 }])).toBeNull();
  });
});

describe("consistencyGrid", () => {
  it("monta uma coluna por semana e marca treinos e dias futuros", () => {
    const grid = consistencyGrid(new Set(["2026-11-17", "2026-11-23"]), TODAY, 2);
    expect(grid).toHaveLength(2);
    expect(grid[0][0].key).toBe("2026-11-15");
    expect(grid[1][6].key).toBe("2026-11-28");
    expect(grid[0][2].trained).toBe(true);
    expect(grid[1][1].trained).toBe(true);
    expect(grid[1][2]).toMatchObject({ key: TODAY, future: false });
    expect(grid[1][3].future).toBe(true);
  });
});

describe("weekStreak", () => {
  it("conta semanas seguidas com treino até a atual", () => {
    const days = new Set(["2026-11-23", "2026-11-18", "2026-11-10", "2026-10-20"]);
    expect(weekStreak(days, TODAY)).toBe(3);
  });

  it("a semana atual ainda sem treino não quebra a sequência", () => {
    expect(weekStreak(new Set(["2026-11-18", "2026-11-10"]), TODAY)).toBe(2);
  });

  it("uma semana vazia no meio zera a contagem", () => {
    expect(weekStreak(new Set(["2026-11-03"]), TODAY)).toBe(0);
  });
});

describe("recentRecords", () => {
  it("lista recordes de cada exercício, do mais novo ao mais antigo", () => {
    const supino1 = set("2026-11-10", 60, 10);
    const supino2 = set("2026-11-17", 62.5, 10);
    const agacho1 = set("2026-11-11", 100, 5, { exerciseId: "ex-agachamento" });
    const agacho2 = set("2026-11-20", 105, 5, { exerciseId: "ex-agachamento" });
    const supino3 = set("2026-11-24", 62.5, 8);
    const records = recentRecords([supino1, supino2, agacho1, agacho2, supino3], 5);
    expect(records.map((r) => r.id)).toEqual([agacho2.id, supino2.id]);
  });

  it("um exercício não conta como recorde só por passar a carga de outro", () => {
    const pesado = set("2026-11-10", 100, 5, { exerciseId: "ex-agachamento" });
    const leve1 = set("2026-11-11", 20, 10, { exerciseId: "ex-rosca" });
    const leve2 = set("2026-11-12", 22, 10, { exerciseId: "ex-rosca" });
    expect(recentRecords([pesado, leve1, leve2], 5).map((r) => r.id)).toEqual([leve2.id]);
  });
});
