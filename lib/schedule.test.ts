import { describe, expect, it } from "vitest";
import type { Schedule } from "@/types";
import {
  EMPTY_SCHEDULE,
  clearDay,
  isRepeating,
  removeWorkoutFromSchedule,
  resolvePlan,
  setDayPlan,
  setRepeat,
  stopRepeat,
} from "@/lib/schedule";

const push = { type: "workout", workoutId: "w-push" } as const;
const pull = { type: "workout", workoutId: "w-pull" } as const;
const rest = { type: "rest" } as const;

// 2026-11-02 é segunda-feira
const MON = "2026-11-02";
const NEXT_MON = "2026-11-09";
const TUE = "2026-11-03";

describe("resolvePlan", () => {
  it("devolve null sem nada planejado", () => {
    expect(resolvePlan(EMPTY_SCHEDULE, MON)).toBeNull();
  });

  it("devolve o plano de uma data específica", () => {
    const s = setDayPlan(EMPTY_SCHEDULE, MON, push);
    expect(resolvePlan(s, MON)).toEqual({ plan: push, source: "day" });
    expect(resolvePlan(s, NEXT_MON)).toBeNull();
  });

  it("aceita descanso como plano", () => {
    expect(resolvePlan(setDayPlan(EMPTY_SCHEDULE, MON, rest), MON)?.plan).toEqual(rest);
  });
});

describe("repetição semanal", () => {
  const repeated = setRepeat(EMPTY_SCHEDULE, MON, push, "r1");

  it("vale na data e nas mesmas segundas seguintes", () => {
    expect(resolvePlan(repeated, MON)).toEqual({ plan: push, source: "rule" });
    expect(resolvePlan(repeated, NEXT_MON)?.plan).toEqual(push);
    expect(resolvePlan(repeated, "2027-03-01")?.plan).toEqual(push);
  });

  it("não vale antes da data de início nem em outros dias da semana", () => {
    expect(resolvePlan(repeated, "2026-10-26")).toBeNull();
    expect(resolvePlan(repeated, TUE)).toBeNull();
  });

  it("uma data específica vence a repetição", () => {
    const s = setDayPlan(repeated, NEXT_MON, pull);
    expect(resolvePlan(s, NEXT_MON)).toEqual({ plan: pull, source: "day" });
    expect(resolvePlan(s, "2026-11-16")?.plan).toEqual(push);
  });

  it("limpar um dia repetido esconde só aquela ocorrência", () => {
    const s = clearDay(repeated, NEXT_MON);
    expect(resolvePlan(s, NEXT_MON)).toBeNull();
    expect(resolvePlan(s, "2026-11-16")?.plan).toEqual(push);
  });

  it("uma nova regra vale a partir da sua data e preserva o passado", () => {
    const s = setRepeat(repeated, NEXT_MON, pull, "r2");
    expect(resolvePlan(s, MON)?.plan).toEqual(push);
    expect(resolvePlan(s, NEXT_MON)?.plan).toEqual(pull);
    expect(resolvePlan(s, "2026-11-16")?.plan).toEqual(pull);
  });

  it("parar a repetição encerra dali em diante", () => {
    const s = stopRepeat(repeated, NEXT_MON, "r2");
    expect(resolvePlan(s, MON)?.plan).toEqual(push);
    expect(resolvePlan(s, NEXT_MON)).toBeNull();
    expect(resolvePlan(s, "2026-11-16")).toBeNull();
    expect(isRepeating(s, MON)).toBe(true);
    expect(isRepeating(s, NEXT_MON)).toBe(false);
  });

  it("repetir na mesma data troca a regra em vez de duplicar", () => {
    const s = setRepeat(repeated, MON, pull, "r2");
    expect(s.rules).toHaveLength(1);
    expect(resolvePlan(s, MON)?.plan).toEqual(pull);
  });

  it("repetir remove o plano avulso da própria data", () => {
    const s = setRepeat(setDayPlan(EMPTY_SCHEDULE, MON, rest), MON, push, "r1");
    expect(s.days).toHaveLength(0);
    expect(resolvePlan(s, MON)?.plan).toEqual(push);
  });
});

describe("clearDay", () => {
  it("remove o plano avulso quando não há repetição", () => {
    const s = clearDay(setDayPlan(EMPTY_SCHEDULE, MON, push), MON);
    expect(s.days).toEqual([]);
  });
});

describe("removeWorkoutFromSchedule", () => {
  it("apaga os dias e encerra as regras daquele treino", () => {
    let s: Schedule = setDayPlan(EMPTY_SCHEDULE, TUE, push);
    s = setRepeat(s, MON, push, "r1");
    s = setDayPlan(s, "2026-11-04", pull);
    const out = removeWorkoutFromSchedule(s, "w-push");
    expect(resolvePlan(out, TUE)).toBeNull();
    expect(resolvePlan(out, NEXT_MON)).toBeNull();
    expect(resolvePlan(out, "2026-11-04")?.plan).toEqual(pull);
  });
});
