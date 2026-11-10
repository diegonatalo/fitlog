import { describe, expect, it } from "vitest";
import { bestSet, dailyBest, estimateOneRepMax, isNewRecord, recordIds } from "@/lib/stats";
import type { LoadType, WorkoutSet } from "@/types";

let seq = 0;
const set = (load: number, reps: number, createdAt: number, loadType: LoadType = "weight"): WorkoutSet => ({
  id: `s${seq++}`,
  exerciseId: "e",
  loadType,
  load,
  reps,
  createdAt,
});

describe("bestSet", () => {
  it("escolhe a série mais pesada", () => {
    const heavy = set(60, 5, 1);
    expect(bestSet([set(40, 12, 0), heavy, set(50, 8, 2)], "weight")).toBe(heavy);
  });

  it("desempata por mais repetições", () => {
    const more = set(60, 8, 2);
    expect(bestSet([set(60, 5, 1), more], "weight")).toBe(more);
  });

  it("ignora séries de outro tipo de carga", () => {
    expect(bestSet([set(100, 10, 1, "plates")], "weight")).toBeNull();
  });

  it("devolve null sem séries", () => {
    expect(bestSet([], "weight")).toBeNull();
  });
});

describe("estimateOneRepMax", () => {
  it("aplica Epley arredondando para 0,5", () => {
    expect(estimateOneRepMax(100, 10)).toBe(133.5); // 133,33 -> 133,5
    expect(estimateOneRepMax(60, 6)).toBe(72);
  });

  it("uma repetição vale a própria carga", () => {
    expect(estimateOneRepMax(80, 1)).toBe(80);
    expect(estimateOneRepMax(80, 0)).toBe(80);
  });
});

describe("recordIds", () => {
  it("a primeira série de um exercício não é recorde", () => {
    const first = set(40, 10, 1);
    expect(recordIds([first]).size).toBe(0);
  });

  it("marca só as séries que superam todas as anteriores, mesmo fora de ordem", () => {
    const a = set(40, 10, 1);
    const b = set(50, 8, 3);
    const c = set(45, 8, 2);
    const d = set(50, 10, 4);
    expect(recordIds([d, b, c, a])).toEqual(new Set([c.id, b.id]));
  });

  it("separa os recordes por tipo de carga", () => {
    const weight = set(100, 5, 1, "weight");
    const plates = set(5, 10, 2, "plates");
    expect(recordIds([weight, plates]).size).toBe(0);
  });
});

describe("isNewRecord", () => {
  it("é recorde só quando passa a maior carga anterior do mesmo tipo", () => {
    const previous = [set(40, 10, 1), set(50, 8, 2)];
    expect(isNewRecord(previous, "weight", 55)).toBe(true);
    expect(isNewRecord(previous, "weight", 50)).toBe(false);
    expect(isNewRecord(previous, "weight", 30)).toBe(false);
  });

  it("sem histórico do tipo não há recorde a bater", () => {
    expect(isNewRecord([], "weight", 100)).toBe(false);
    expect(isNewRecord([set(10, 10, 1, "plates")], "weight", 100)).toBe(false);
  });
});

describe("dailyBest", () => {
  const day = (d: number, hour = 12) => new Date(2026, 0, d, hour).getTime();

  it("guarda a melhor carga de cada dia, do mais antigo ao mais novo", () => {
    const result = dailyBest(
      [set(50, 8, day(5, 18)), set(40, 10, day(5, 9)), set(45, 10, day(3))],
      "weight",
    );
    expect(result).toEqual([
      { day: new Date(2026, 0, 3).getTime(), load: 45 },
      { day: new Date(2026, 0, 5).getTime(), load: 50 },
    ]);
  });

  it("ignora outros tipos de carga", () => {
    expect(dailyBest([set(5, 10, day(1), "plates")], "weight")).toEqual([]);
  });
});
