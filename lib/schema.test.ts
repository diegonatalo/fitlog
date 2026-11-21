import { describe, expect, it } from "vitest";
import {
  LIMITS,
  normalizeCardioProfile,
  normalizeCardioSession,
  normalizeSchedule,
  normalizeList,
  normalizeSession,
  normalizeSet,
  normalizeWorkout,
} from "@/lib/schema";

describe("normalizeSet", () => {
  const base = { id: "s1", exerciseId: "e1", load: 40, reps: 10, loadType: "weight", createdAt: 3 };

  it("mantém uma série válida e arredonda as repetições", () => {
    expect(normalizeSet({ ...base, reps: 8.6 })).toMatchObject({ load: 40, reps: 9 });
  });

  it("repetições inválidas viram 1", () => {
    expect(normalizeSet({ ...base, reps: 0 })?.reps).toBe(1);
    expect(normalizeSet({ ...base, reps: "x" })?.reps).toBe(1);
  });

  it("aceita carga zero, mas não negativa nem ausente", () => {
    expect(normalizeSet({ ...base, load: 0 })?.load).toBe(0);
    expect(normalizeSet({ ...base, load: -1 })).toBeNull();
    expect(normalizeSet({ ...base, load: undefined })).toBeNull();
  });

  it("exige id e exercício", () => {
    expect(normalizeSet({ ...base, id: "" })).toBeNull();
    expect(normalizeSet({ ...base, exerciseId: undefined })).toBeNull();
  });

  it("mantém o equipamento válido e ignora o desconhecido", () => {
    expect(normalizeSet({ ...base, equipment: "dumbbell" })?.equipment).toBe("dumbbell");
    expect(normalizeSet({ ...base, equipment: "foguete" })?.equipment).toBeUndefined();
    expect(normalizeSet(base)?.equipment).toBeUndefined();
  });

  it("limpa observação vazia", () => {
    expect(normalizeSet({ ...base, note: "   " })?.note).toBeUndefined();
    expect(normalizeSet({ ...base, note: " ok " })?.note).toBe("ok");
  });
});

describe("normalizeWorkout", () => {
  it("filtra ids de exercícios que não são texto", () => {
    expect(normalizeWorkout({ id: "w", name: "Push", exerciseIds: ["a", 1, null, "b"] })?.exerciseIds).toEqual([
      "a",
      "b",
    ]);
  });

  it("aceita treino sem lista de exercícios", () => {
    expect(normalizeWorkout({ id: "w", name: "Push" })?.exerciseIds).toEqual([]);
  });

  it("exige nome", () => {
    expect(normalizeWorkout({ id: "w", name: " " })).toBeNull();
  });
});

describe("normalizeSession", () => {
  it("usa Treino livre quando falta o nome e mantém a sessão em andamento", () => {
    expect(normalizeSession({ id: "s", startedAt: 10 })).toMatchObject({
      name: "Treino livre",
      workoutId: null,
      finishedAt: null,
    });
  });

  it("exige id e início", () => {
    expect(normalizeSession({ id: "s" })).toBeNull();
    expect(normalizeSession({ startedAt: 1 })).toBeNull();
  });
});

describe("cardio", () => {
  const session = {
    id: "c1",
    createdAt: 1,
    speedKmh: 6,
    inclinePct: 5,
    minutes: 30,
    weightKg: 70,
    kcal: 200,
    avgHr: 130,
  };

  it("normalizeCardioSession mantém uma sessão completa", () => {
    expect(normalizeCardioSession(session)).toEqual(session);
  });

  it("normalizeCardioSession descarta sessão com campo faltando", () => {
    expect(normalizeCardioSession({ ...session, avgHr: undefined })).toBeNull();
    expect(normalizeCardioSession({ ...session, kcal: "200" })).toBeNull();
  });

  it("normalizeCardioProfile exige peso, idade e sexo válidos", () => {
    expect(normalizeCardioProfile({ weightKg: 70, age: 30, sex: "female" })).toEqual({
      weightKg: 70,
      age: 30,
      sex: "female",
    });
    expect(normalizeCardioProfile({ weightKg: 0, age: 30, sex: "male" })).toBeNull();
    expect(normalizeCardioProfile({ weightKg: 70, age: 30, sex: "x" })).toBeNull();
    expect(normalizeCardioProfile(null)).toBeNull();
  });
});

describe("normalizeSchedule", () => {
  it("devolve agenda vazia para lixo", () => {
    for (const v of [null, "x", [], 7, undefined]) {
      expect(normalizeSchedule(v)).toEqual({ days: [], rules: [] });
    }
  });

  it("descarta dias e regras inválidos e mantém os bons", () => {
    const out = normalizeSchedule({
      days: [
        { date: "2026-11-02", plan: { type: "rest" } },
        { date: "2026-02-30", plan: { type: "rest" } },
        { date: "2026-11-03", plan: { type: "workout" } },
        { date: "2026-11-04", plan: { type: "workout", workoutId: "w" } },
      ],
      rules: [
        { id: "r", weekday: 2, from: "2026-11-03", plan: { type: "none" } },
        { id: "r", weekday: 9, from: "2026-11-03", plan: { type: "rest" } },
        { id: "", weekday: 1, from: "2026-11-03", plan: { type: "rest" } },
      ],
    });
    expect(out.days.map((d) => d.date)).toEqual(["2026-11-02", "2026-11-04"]);
    expect(out.rules).toHaveLength(1);
  });
});

describe("normalizeList", () => {
  it("descarta itens inválidos e devolve null se não for lista", () => {
    const result = normalizeList([{ id: "w", name: "A" }, 1, null], normalizeWorkout);
    expect(result).toHaveLength(1);
    expect(normalizeList({}, normalizeWorkout)).toBeNull();
    expect(normalizeList(undefined, normalizeWorkout)).toBeNull();
  });
});

describe("limites", () => {
  const long = (n: number) => "a".repeat(n);

  it("recusa ids mais longos que o limite", () => {
    expect(normalizeWorkout({ id: long(LIMITS.id + 1), name: "A" })).toBeNull();
    expect(normalizeWorkout({ id: long(LIMITS.id), name: "A" })).not.toBeNull();
  });

  it("corta nomes e anotações longas", () => {
    expect(normalizeWorkout({ id: "w", name: long(500) })?.name).toHaveLength(LIMITS.name);
    const set = normalizeSet({ id: "s", exerciseId: "e", load: 1, reps: 1, note: long(1000) });
    expect(set?.note).toHaveLength(LIMITS.setNote);
    const session = normalizeSession({ id: "x", startedAt: 1, note: long(5000) });
    expect(session?.note).toHaveLength(LIMITS.sessionNote);
  });

  it("limita e tira repetidos dos exercícios de um treino", () => {
    const ids = Array.from({ length: LIMITS.exercisesPerWorkout + 50 }, (_, i) => `ex-${i}`);
    expect(normalizeWorkout({ id: "w", name: "A", exerciseIds: ids })?.exerciseIds).toHaveLength(
      LIMITS.exercisesPerWorkout,
    );
    expect(normalizeWorkout({ id: "w", name: "A", exerciseIds: ["a", "a", "b"] })?.exerciseIds).toEqual(["a", "b"]);
  });

  it("guarda só os dias mais recentes da agenda", () => {
    const days = Array.from({ length: LIMITS.scheduleDays + 10 }, (_, i) => ({
      date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
      plan: { type: "rest" },
    }));
    const schedule = normalizeSchedule({ days, rules: [] });
    expect(schedule.days).toHaveLength(LIMITS.scheduleDays);
  });
});