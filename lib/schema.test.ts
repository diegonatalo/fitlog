import { describe, expect, it } from "vitest";
import {
  buildBackup,
  normalizeCardioProfile,
  normalizeCardioSession,
  normalizeExercise,
  normalizeList,
  normalizeSession,
  normalizeSet,
  normalizeWorkout,
  parseBackup,
  type BackupData,
} from "@/lib/schema";

describe("normalizeExercise", () => {
  it("mantém um exercício válido", () => {
    expect(
      normalizeExercise({
        id: "e1",
        name: "  Supino  ",
        muscleGroup: "chest",
        loadType: "plates",
        archived: true,
        createdAt: 5,
      }),
    ).toEqual({
      id: "e1",
      name: "Supino",
      muscleGroup: "chest",
      loadType: "plates",
      archived: true,
      createdAt: 5,
    });
  });

  it("usa valores padrão para grupo e carga desconhecidos", () => {
    const result = normalizeExercise({ id: "e1", name: "X", muscleGroup: "?", loadType: "?", createdAt: 1 });
    expect(result).toMatchObject({ muscleGroup: "other", loadType: "weight" });
  });

  it("só marca arquivado quando é exatamente true", () => {
    expect(normalizeExercise({ id: "e", name: "X", archived: "sim" })).not.toHaveProperty("archived");
  });

  it.each([null, "x", [], {}, { id: "e" }, { name: "X" }, { id: "e", name: "   " }])(
    "descarta %j",
    (value) => {
      expect(normalizeExercise(value)).toBeNull();
    },
  );
});

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

describe("normalizeList", () => {
  it("descarta itens inválidos e devolve null se não for lista", () => {
    const result = normalizeList([{ id: "w", name: "A" }, 1, null], normalizeWorkout);
    expect(result).toHaveLength(1);
    expect(normalizeList({}, normalizeWorkout)).toBeNull();
    expect(normalizeList(undefined, normalizeWorkout)).toBeNull();
  });
});

describe("backup", () => {
  const data: BackupData = {
    exercises: [{ id: "e1", name: "Supino", muscleGroup: "chest", loadType: "weight", createdAt: 1 }],
    sets: [{ id: "s1", exerciseId: "e1", loadType: "weight", load: 40, reps: 10, createdAt: 2 }],
    workouts: [{ id: "w1", name: "Push", exerciseIds: ["e1"], createdAt: 3 }],
    sessions: [{ id: "ss1", workoutId: "w1", name: "Push", startedAt: 4, finishedAt: 5 }],
    cardioSessions: [],
    cardioProfile: { weightKg: 70, age: 30, sex: "male" },
  };

  it("exportar e importar devolve os mesmos dados", () => {
    expect(parseBackup(buildBackup(data))).toEqual(data);
  });

  it("o arquivo exportado identifica o app e a versão", () => {
    const file = JSON.parse(buildBackup(data));
    expect(file).toMatchObject({ app: "treino-log", version: 1 });
    expect(new Date(file.exportedAt).toString()).not.toBe("Invalid Date");
  });

  it("aceita backup antigo sem cardio", () => {
    const { cardioSessions, cardioProfile, ...old } = JSON.parse(buildBackup(data));
    void cardioSessions;
    void cardioProfile;
    expect(parseBackup(JSON.stringify(old))).toMatchObject({ cardioSessions: [], cardioProfile: null });
  });

  it("recusa texto que não é JSON", () => {
    expect(() => parseBackup("{quebrado")).toThrow("O arquivo não é um JSON válido.");
  });

  it("recusa JSON de outro app", () => {
    expect(() => parseBackup(JSON.stringify({ app: "outro" }))).toThrow("Este arquivo não é um backup do FitLog.");
    expect(() => parseBackup("[]")).toThrow("Este arquivo não é um backup do FitLog.");
  });

  it("recusa backup incompleto", () => {
    expect(() => parseBackup(JSON.stringify({ app: "treino-log", exercises: [] }))).toThrow(
      "O backup está incompleto ou corrompido.",
    );
  });
});
