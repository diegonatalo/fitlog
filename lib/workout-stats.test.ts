import { describe, expect, it } from "vitest";
import type { Schedule, WorkoutSession, WorkoutSet } from "@/types";
import {
  averageMinutes,
  dayName,
  nextPlannedDay,
  previousSessionSets,
  timesDone,
  weeklyLabel,
  workoutInitial,
} from "@/lib/workout-stats";

// 2026-11-24 é uma terça
const TODAY = "2026-11-24";

const session = (id: string, workoutId: string | null, minutes: number | null): WorkoutSession => ({
  id,
  workoutId,
  name: "Treino",
  startedAt: 1_000_000,
  finishedAt: minutes === null ? null : 1_000_000 + minutes * 60_000,
});

describe("timesDone e averageMinutes", () => {
  const sessions = [session("a", "w1", 50), session("b", "w1", 61), session("c", "w1", null), session("d", "w2", 30)];

  it("contam só as sessões terminadas daquele treino", () => {
    expect(timesDone(sessions, "w1")).toBe(2);
    expect(averageMinutes(sessions, "w1")).toBe(56);
  });

  it("sem sessões, não há média", () => {
    expect(timesDone(sessions, "w3")).toBe(0);
    expect(averageMinutes(sessions, "w3")).toBeNull();
  });
});

const schedule: Schedule = {
  days: [{ date: "2026-11-24", plan: { type: "rest" } }],
  rules: [
    { id: "r1", weekday: 2, from: "2026-01-01", plan: { type: "workout", workoutId: "w1" } },
    { id: "r2", weekday: 4, from: "2026-01-01", plan: { type: "workout", workoutId: "w1" } },
    { id: "r3", weekday: 6, from: "2026-01-01", plan: { type: "workout", workoutId: "w2" } },
  ],
};

describe("nextPlannedDay", () => {
  it("acha o próximo dia do treino, respeitando um dia mudado à mão", () => {
    // hoje (terça) virou descanso, então o próximo é quinta
    expect(nextPlannedDay(schedule, "w1", TODAY)).toBe("2026-11-26");
    expect(nextPlannedDay(schedule, "w2", TODAY)).toBe("2026-11-28");
    expect(nextPlannedDay(schedule, "w9", TODAY)).toBeNull();
  });
});

describe("dayName", () => {
  it("diz hoje, amanhã ou o dia da semana", () => {
    expect(dayName(TODAY, TODAY)).toBe("Hoje");
    expect(dayName("2026-11-25", TODAY)).toBe("Amanhã");
    expect(dayName("2026-11-26", TODAY)).toBe("Quinta");
  });
});

describe("weeklyLabel", () => {
  it("lista os dias da regra semanal", () => {
    expect(weeklyLabel(schedule, "w1")).toBe("Toda terça e quinta");
    expect(weeklyLabel(schedule, "w2")).toBe("Todo sábado");
    expect(weeklyLabel(schedule, "w9")).toBeNull();
  });
});

describe("previousSessionSets", () => {
  const set = (id: string, sessionId: string | undefined, createdAt: number): WorkoutSet => ({
    id,
    exerciseId: "ex",
    sessionId,
    loadType: "weight",
    load: 60,
    reps: 10,
    createdAt,
  });
  // mais novo primeiro, como em setsByExercise
  const history = [set("now1", "s3", 50), set("b2", "s2", 41), set("b1", "s2", 40), set("a1", "s1", 10)];

  it("pega as séries da sessão anterior, em ordem", () => {
    expect(previousSessionSets(history, "s3").map((s) => s.id)).toEqual(["b1", "b2"]);
  });

  it("sem sessão anterior, não há nada", () => {
    expect(previousSessionSets([set("x", "s3", 1)], "s3")).toEqual([]);
  });
});

describe("workoutInitial", () => {
  it("usa a letra ou o número do nome, ou a inicial", () => {
    expect(workoutInitial("Treino A")).toBe("A");
    expect(workoutInitial("Treino A · Peito e tríceps")).toBe("A");
    expect(workoutInitial("Treino 2")).toBe("2");
    expect(workoutInitial("Pernas")).toBe("P");
    expect(workoutInitial("push")).toBe("P");
  });
});
