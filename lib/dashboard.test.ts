import { describe, expect, it } from "vitest";
import type { MuscleGroup, WorkoutSession, WorkoutSet } from "@/types";
import { dashboardStats } from "@/lib/dashboard";

const TODAY = "2026-11-14";
const at = (key: string, hour = 10) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, hour).getTime();
};

let seq = 0;
const session = (day: string, minutes: number | null): WorkoutSession => ({
  id: `s${seq++}`,
  workoutId: null,
  name: "Treino",
  startedAt: at(day),
  finishedAt: minutes === null ? null : at(day) + minutes * 60_000,
});

const set = (
  day: string,
  load: number,
  reps: number,
  patch: Partial<WorkoutSet> = {},
): WorkoutSet => ({
  id: `t${seq++}`,
  exerciseId: "ex-supino-reto",
  loadType: "weight",
  load,
  reps,
  createdAt: at(day),
  ...patch,
});

const groupOf = (id: string): MuscleGroup | undefined =>
  id === "ex-supino-reto" ? "chest" : id === "ex-remada-baixa" ? "back" : undefined;

describe("dashboardStats", () => {
  it("zera tudo sem dados", () => {
    expect(dashboardStats([], [], TODAY, groupOf)).toEqual({
      sessions7: 0,
      sessions30: 0,
      volume7: 0,
      records30: 0,
      avgMinutes: null,
      muscles30: [],
    });
  });

  it("conta treinos nas janelas de 7 e 30 dias, incluindo hoje", () => {
    const sessions = [
      session("2026-11-14", 60), // hoje
      session("2026-11-08", 60), // 6 dias atrás: dentro dos 7
      session("2026-11-07", 60), // 7 dias atrás: fora dos 7, dentro dos 30
      session("2026-10-16", 60), // 29 dias atrás: dentro dos 30
      session("2026-10-15", 60), // 30 dias atrás: fora
    ];
    const stats = dashboardStats(sessions, [], TODAY, groupOf);
    expect(stats.sessions7).toBe(2);
    expect(stats.sessions30).toBe(4);
  });

  it("ignora sessões em andamento", () => {
    const stats = dashboardStats([session(TODAY, null)], [], TODAY, groupOf);
    expect(stats.sessions7).toBe(0);
    expect(stats.avgMinutes).toBeNull();
  });

  it("calcula a duração média em minutos", () => {
    const sessions = [session("2026-11-13", 40), session("2026-11-12", 70)];
    expect(dashboardStats(sessions, [], TODAY, groupOf).avgMinutes).toBe(55);
  });

  it("soma volume só de carga em kg nos últimos 7 dias", () => {
    const sets = [
      set(TODAY, 40, 10), // 400
      set("2026-11-10", 50, 8), // 400
      set("2026-11-01", 100, 10), // fora dos 7 dias
      set(TODAY, 8, 12, { loadType: "plates" }), // placas não entram
    ];
    expect(dashboardStats([], sets, TODAY, groupOf).volume7).toBe(800);
  });

  it("conta recordes recentes, sem contar a primeira série", () => {
    const sets = [
      set("2026-09-01", 40, 10), // primeira série: não é recorde
      set("2026-11-05", 45, 10), // recorde, dentro dos 30 dias
      set("2026-11-06", 40, 10), // não bate
      set("2026-11-10", 50, 5), // recorde
    ];
    expect(dashboardStats([], sets, TODAY, groupOf).records30).toBe(2);
  });

  it("agrupa séries por músculo, do mais treinado ao menos", () => {
    const sets = [
      set(TODAY, 40, 10),
      set(TODAY, 40, 10),
      set(TODAY, 30, 10, { exerciseId: "ex-remada-baixa" }),
      set(TODAY, 30, 10, { exerciseId: "ex-desconhecido" }),
      set("2026-08-01", 40, 10), // fora da janela
    ];
    expect(dashboardStats([], sets, TODAY, groupOf).muscles30).toEqual([
      { group: "chest", sets: 2 },
      { group: "back", sets: 1 },
    ]);
  });
});
