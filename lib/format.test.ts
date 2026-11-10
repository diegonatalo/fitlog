import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatClock,
  formatDuration,
  formatLoad,
  formatSet,
  loadParts,
  relativeDay,
} from "@/lib/format";
import { loadTypeMeta, muscleLabel } from "@/types";

describe("relativeDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 10, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  const daysAgo = (n: number, hour = 22) => new Date(2026, 5, 15 - n, hour).getTime();

  it("diferencia hoje e ontem pelo calendário, não pelas 24 horas", () => {
    expect(relativeDay(daysAgo(0, 1))).toBe("Hoje");
    expect(relativeDay(daysAgo(1, 23))).toBe("Ontem");
  });

  it("conta dias atrás até uma semana", () => {
    expect(relativeDay(daysAgo(2))).toBe("2 dias atrás");
    expect(relativeDay(daysAgo(6))).toBe("6 dias atrás");
  });

  it("depois de uma semana mostra a data", () => {
    expect(relativeDay(daysAgo(7))).not.toMatch(/atrás|Hoje|Ontem/);
  });
});

describe("formatDuration", () => {
  const minutes = (n: number) => n * 60_000;

  it.each([
    [0, "1 min"],
    [minutes(1), "1 min"],
    [minutes(45), "45 min"],
    [minutes(60), "1h"],
    [minutes(95), "1h 35min"],
  ])("%s ms vira %s", (ms, text) => {
    expect(formatDuration(0, ms)).toBe(text);
  });
});

describe("formatClock", () => {
  it.each([
    [0, "00:00"],
    [75, "01:15"],
    [3599, "59:59"],
    [3600, "1:00:00"],
    [3725, "1:02:05"],
    [-10, "00:00"],
    [59.9, "00:59"],
  ])("%s s vira %s", (seconds, text) => {
    expect(formatClock(seconds)).toBe(text);
  });
});

describe("carga", () => {
  it("loadParts separa valor e unidade", () => {
    expect(loadParts("weight", 40)).toEqual({ value: "40", unit: "kg" });
    expect(loadParts("plates", 7)).toEqual({ value: "7", unit: "placas" });
    expect(loadParts("time", 20)).toEqual({ value: "20", unit: "min" });
  });

  it("peso corporal mostra a carga extra com sinal", () => {
    expect(loadParts("bodyweight", 0)).toEqual({ value: "0", unit: "corporal" });
    expect(loadParts("bodyweight", 5)).toEqual({ value: "+5", unit: "kg" });
  });

  it("formatLoad junta valor e unidade", () => {
    expect(formatLoad("weight", 42.5)).toBe("42.5 kg");
  });

  it("formatSet inclui as repetições, exceto em exercícios de tempo", () => {
    expect(formatSet({ loadType: "weight", load: 40, reps: 12 })).toBe("40 kg × 12");
    expect(formatSet({ loadType: "time", load: 20, reps: 1 })).toBe("20 min");
  });
});

describe("metadados de tipos", () => {
  it("loadTypeMeta cai em peso para um tipo desconhecido", () => {
    expect(loadTypeMeta("nada" as never).value).toBe("weight");
  });

  it("só o exercício de tempo não tem repetições e só o corporal aceita carga zero", () => {
    expect(loadTypeMeta("time").hasReps).toBe(false);
    expect(loadTypeMeta("weight").hasReps).toBe(true);
    expect(loadTypeMeta("bodyweight").allowZero).toBe(true);
    expect(loadTypeMeta("weight").allowZero).toBe(false);
  });

  it("muscleLabel traduz o grupo e cai em Outro", () => {
    expect(muscleLabel("chest")).toBe("Peito");
    expect(muscleLabel("nada" as never)).toBe("Outro");
  });
});
