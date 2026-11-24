import { describe, expect, it } from "vitest";
import type { Schedule } from "@/types";
import { shortDayLabel, weekStrip } from "@/lib/week";

// 2026-11-24 é uma terça-feira; a semana vai de 23 (segunda) a 29 (domingo)
const TODAY = "2026-11-24";

const schedule: Schedule = {
  days: [{ date: "2026-11-27", plan: { type: "rest" } }],
  rules: [
    { id: "r1", weekday: 1, from: "2026-01-01", plan: { type: "workout", workoutId: "a" } },
    { id: "r2", weekday: 2, from: "2026-01-01", plan: { type: "workout", workoutId: "b" } },
    { id: "r4", weekday: 4, from: "2026-01-01", plan: { type: "workout", workoutId: "c" } },
  ],
};

describe("weekStrip", () => {
  it("lista a semana de segunda a domingo e marca hoje", () => {
    const week = weekStrip(TODAY, schedule, new Set());
    expect(week.map((d) => d.key)).toEqual([
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
      "2026-11-28",
      "2026-11-29",
    ]);
    expect(week.map((d) => d.letter).join("")).toBe("STQQSSD");
    expect(week.filter((d) => d.isToday).map((d) => d.day)).toEqual([24]);
  });

  it("separa feito, perdido, planejado, descanso e livre", () => {
    const week = weekStrip(TODAY, schedule, new Set(["2026-11-29"]));
    expect(week.map((d) => d.status)).toEqual([
      "missed", // segunda passou sem o treino planejado
      "planned", // hoje ainda pode treinar
      "free",
      "planned",
      "rest",
      "free",
      "done", // domingo sem plano, mas com treino feito
    ]);
  });

  it("um treino feito vale mais que o plano do dia", () => {
    const week = weekStrip(TODAY, schedule, new Set(["2026-11-23", "2026-11-27"]));
    expect(week[0].status).toBe("done");
    expect(week[4].status).toBe("done");
  });

  it("funciona quando hoje é segunda ou domingo", () => {
    expect(weekStrip("2026-11-23", schedule, new Set())[0].isToday).toBe(true);
    expect(weekStrip("2026-11-29", schedule, new Set())[6].isToday).toBe(true);
  });
});

describe("shortDayLabel", () => {
  it("escreve o dia da semana, o dia e o mês curto", () => {
    expect(shortDayLabel(TODAY)).toBe("terça · 24 nov");
    expect(shortDayLabel("2027-01-03")).toBe("domingo · 3 jan");
  });
});
