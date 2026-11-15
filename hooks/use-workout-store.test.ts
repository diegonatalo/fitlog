import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { STORAGE_KEYS } from "@/lib/storage";

const setup = () => renderHook(() => useWorkoutStore()).result;

beforeEach(() => localStorage.clear());

describe("useWorkoutStore: séries", () => {
  it("registra a série mais nova primeiro e persiste", () => {
    const store = setup();
    act(() => {
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10);
    });
    act(() => {
      store.current.addSet("supino-reto", "barbell", "weight", 50, 8);
    });
    expect(store.current.sets.map((s) => s.load)).toEqual([50, 40]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.sets)!)).toHaveLength(2);
    expect(store.current.setsByExercise.get("supino-reto")?.map((s) => s.load)).toEqual([50, 40]);
  });

  it("editar carga e repetições mantém a anotação; anotação vazia é removida", () => {
    const store = setup();
    let id = "";
    act(() => {
      id = store.current.addSet("supino-reto", "barbell", "weight", 40, 10).id;
    });
    act(() => store.current.updateSet(id, { note: "  pegada fechada  " }));
    expect(store.current.sets[0].note).toBe("pegada fechada");
    act(() => store.current.updateSet(id, { load: 45 }));
    expect(store.current.sets[0]).toMatchObject({ load: 45, note: "pegada fechada" });
    act(() => store.current.updateSet(id, { note: "   " }));
    expect(store.current.sets[0].note).toBeUndefined();
  });

  it("remove uma série", () => {
    const store = setup();
    let id = "";
    act(() => {
      id = store.current.addSet("supino-reto", "barbell", "weight", 40, 10).id;
    });
    act(() => store.current.removeSet(id));
    expect(store.current.sets).toEqual([]);
  });
});

describe("useWorkoutStore: treinos", () => {
  it("não cria treino sem nome e limpa espaços do nome", () => {
    const store = setup();
    const before = store.current.workouts.length;
    act(() => {
      store.current.addWorkout("   ", []);
    });
    expect(store.current.workouts).toHaveLength(before);
    act(() => {
      store.current.addWorkout("  Peito  ", ["supino-reto"]);
    });
    expect(store.current.workouts[0]).toMatchObject({ name: "Peito", exerciseIds: ["supino-reto"] });
  });

  it("renomear para vazio mantém o nome antigo", () => {
    const store = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    const id = store.current.workouts[0].id;
    act(() => store.current.updateWorkout(id, { name: "  " }));
    expect(store.current.workouts[0].name).toBe("Peito");
    act(() => store.current.updateWorkout(id, { name: "Peito e tríceps " }));
    expect(store.current.workouts[0].name).toBe("Peito e tríceps");
  });

  it("remover o treino também tira ele da agenda", () => {
    const store = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    const id = store.current.workouts[0].id;
    const days = store.current.schedule.days.length;
    act(() => store.current.planDay("2026-03-02", { type: "workout", workoutId: id }, false));
    expect(store.current.schedule.days).toHaveLength(days + 1);
    act(() => store.current.removeWorkout(id));
    expect(store.current.workouts.find((w) => w.id === id)).toBeUndefined();
    expect(store.current.schedule.days).toHaveLength(days);
  });
});

describe("useWorkoutStore: sessões", () => {
  it("só uma sessão por vez: começar de novo retoma a ativa", () => {
    const store = setup();
    let first = "";
    act(() => {
      first = store.current.startSession(null).id;
    });
    expect(store.current.activeSession?.name).toBe("Treino livre");
    let second = "";
    act(() => {
      second = store.current.startSession(null).id;
    });
    expect(second).toBe(first);
    expect(store.current.sessions).toHaveLength(1);
  });

  it("finalizar tira a sessão de ativa e entra no histórico", () => {
    const store = setup();
    let id = "";
    act(() => {
      id = store.current.startSession(null).id;
    });
    act(() => store.current.finishSession(id));
    expect(store.current.activeSession).toBeNull();
    expect(store.current.finishedSessions.map((s) => s.id)).toEqual([id]);
  });

  it("remover a sessão apaga as séries dela, e só as dela", () => {
    const store = setup();
    let id = "";
    act(() => {
      id = store.current.startSession(null).id;
    });
    act(() => {
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10, id);
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10);
    });
    expect(store.current.setsBySession.get(id)).toHaveLength(1);
    act(() => store.current.removeSession(id));
    expect(store.current.sessions).toEqual([]);
    expect(store.current.sets).toHaveLength(1);
  });
});

describe("useWorkoutStore: geral", () => {
  it("o descanso fica dentro dos limites", () => {
    const store = setup();
    act(() => store.current.setRestSeconds(-10));
    expect(store.current.restSeconds).toBeGreaterThan(0);
  });

  it("apagar tudo zera os dados", () => {
    const store = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10);
    });
    act(() => store.current.clearAll());
    expect(store.current.workouts).toEqual([]);
    expect(store.current.sets).toEqual([]);
    expect(store.current.schedule).toEqual({ days: [], rules: [] });
  });
});
