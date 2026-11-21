import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWorkoutStore, type Persistence } from "@/hooks/use-workout-store";
import type { AppData } from "@/lib/schema";
import { EMPTY_BACKUP } from "@/lib/schema";

const EMPTY: AppData = { ...EMPTY_BACKUP, restSeconds: 90 };

const mockPersistence = (): Persistence => ({
  saveSet: vi.fn(async () => {}),
  deleteSet: vi.fn(async () => {}),
  saveWorkout: vi.fn(async () => {}),
  deleteWorkout: vi.fn(async () => {}),
  saveSession: vi.fn(async () => {}),
  deleteSession: vi.fn(async () => {}),
  saveCardioSession: vi.fn(async () => {}),
  deleteCardioSession: vi.fn(async () => {}),
  saveSchedule: vi.fn(async () => {}),
  saveCardioProfile: vi.fn(async () => {}),
  saveRestSeconds: vi.fn(async () => {}),
  replaceAllData: vi.fn(async () => {}),
});

const setup = (initial: Partial<AppData> = {}) => {
  const persist = mockPersistence();
  const { result } = renderHook(() => useWorkoutStore({ ...EMPTY, ...initial }, persist));
  return { store: result, persist };
};

afterEach(() => vi.restoreAllMocks());

describe("useWorkoutStore: dados iniciais", () => {
  it("começa com o que veio do servidor", () => {
    const workout = { id: "w", name: "Push", exerciseIds: [], createdAt: 1 };
    const { store } = setup({ workouts: [workout], restSeconds: 120 });
    expect(store.current.workouts).toEqual([workout]);
    expect(store.current.restSeconds).toBe(120);
    expect(store.current.syncError).toBe(false);
  });
});

describe("useWorkoutStore: séries", () => {
  it("registra a série mais nova primeiro e salva cada uma", () => {
    const { store, persist } = setup();
    act(() => {
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10);
    });
    act(() => {
      store.current.addSet("supino-reto", "barbell", "weight", 50, 8);
    });
    expect(store.current.sets.map((s) => s.load)).toEqual([50, 40]);
    expect(persist.saveSet).toHaveBeenCalledTimes(2);
    expect(persist.saveSet).toHaveBeenLastCalledWith(store.current.sets[0]);
    expect(store.current.setsByExercise.get("supino-reto")?.map((s) => s.load)).toEqual([50, 40]);
  });

  it("editar carga e repetições mantém a anotação; anotação vazia é removida", () => {
    const { store, persist } = setup();
    let id = "";
    act(() => {
      id = store.current.addSet("supino-reto", "barbell", "weight", 40, 10).id;
    });
    act(() => store.current.updateSet(id, { note: "  pegada fechada  " }));
    expect(store.current.sets[0].note).toBe("pegada fechada");
    act(() => store.current.updateSet(id, { load: 45 }));
    expect(store.current.sets[0]).toMatchObject({ load: 45, note: "pegada fechada" });
    expect(persist.saveSet).toHaveBeenLastCalledWith(
      expect.objectContaining({ id, load: 45, note: "pegada fechada" }),
    );
    act(() => store.current.updateSet(id, { note: "   " }));
    expect(store.current.sets[0].note).toBeUndefined();
  });

  it("editar uma série que não existe não salva nada", () => {
    const { store, persist } = setup();
    act(() => store.current.updateSet("nao-existe", { load: 10 }));
    expect(persist.saveSet).not.toHaveBeenCalled();
  });

  it("remove uma série", () => {
    const { store, persist } = setup();
    let id = "";
    act(() => {
      id = store.current.addSet("supino-reto", "barbell", "weight", 40, 10).id;
    });
    act(() => store.current.removeSet(id));
    expect(store.current.sets).toEqual([]);
    expect(persist.deleteSet).toHaveBeenCalledWith(id);
  });
});

describe("useWorkoutStore: treinos", () => {
  it("não cria treino sem nome e limpa espaços do nome", () => {
    const { store, persist } = setup();
    act(() => {
      store.current.addWorkout("   ", []);
    });
    expect(store.current.workouts).toHaveLength(0);
    expect(persist.saveWorkout).not.toHaveBeenCalled();
    act(() => {
      store.current.addWorkout("  Peito  ", ["supino-reto"]);
    });
    expect(store.current.workouts[0]).toMatchObject({ name: "Peito", exerciseIds: ["supino-reto"] });
    expect(persist.saveWorkout).toHaveBeenCalledWith(store.current.workouts[0]);
  });

  it("renomear para vazio mantém o nome antigo", () => {
    const { store, persist } = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    const id = store.current.workouts[0].id;
    act(() => store.current.updateWorkout(id, { name: "  " }));
    expect(store.current.workouts[0].name).toBe("Peito");
    act(() => store.current.updateWorkout(id, { name: "Peito e tríceps " }));
    expect(store.current.workouts[0].name).toBe("Peito e tríceps");
    expect(persist.saveWorkout).toHaveBeenLastCalledWith(
      expect.objectContaining({ id, name: "Peito e tríceps" }),
    );
  });

  it("remover o treino também tira ele da agenda, e salva os dois", () => {
    const { store, persist } = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    const id = store.current.workouts[0].id;
    act(() => store.current.planDay("2026-03-02", { type: "workout", workoutId: id }, false));
    expect(store.current.schedule.days).toHaveLength(1);
    act(() => store.current.removeWorkout(id));
    expect(store.current.workouts.find((w) => w.id === id)).toBeUndefined();
    expect(store.current.schedule.days).toHaveLength(0);
    expect(persist.deleteWorkout).toHaveBeenCalledWith(id);
    expect(persist.saveSchedule).toHaveBeenLastCalledWith({ days: [], rules: [] });
  });
});

describe("useWorkoutStore: agenda", () => {
  it("repetir toda semana cria uma regra; parar de repetir salva de novo", () => {
    const { store, persist } = setup();
    act(() => store.current.planDay("2026-03-02", { type: "rest" }, true));
    expect(store.current.schedule.rules).toHaveLength(1);
    expect(persist.saveSchedule).toHaveBeenCalledWith(store.current.schedule);
    act(() => store.current.stopRepeating("2026-03-09"));
    expect(persist.saveSchedule).toHaveBeenCalledTimes(2);
  });
});

describe("useWorkoutStore: sessões", () => {
  it("só uma sessão por vez: começar de novo retoma a ativa", () => {
    const { store, persist } = setup();
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
    expect(persist.saveSession).toHaveBeenCalledTimes(1);
  });

  it("finalizar tira a sessão de ativa, entra no histórico e salva", () => {
    const { store, persist } = setup();
    let id = "";
    act(() => {
      id = store.current.startSession(null).id;
    });
    act(() => store.current.finishSession(id));
    expect(store.current.activeSession).toBeNull();
    expect(store.current.finishedSessions.map((s) => s.id)).toEqual([id]);
    expect(persist.saveSession).toHaveBeenLastCalledWith(
      expect.objectContaining({ id, finishedAt: expect.any(Number) }),
    );
  });

  it("anotar a sessão salva a nota", () => {
    const { store, persist } = setup();
    let id = "";
    act(() => {
      id = store.current.startSession(null).id;
    });
    act(() => store.current.updateSession(id, { note: "pesado hoje" }));
    expect(store.current.sessions[0].note).toBe("pesado hoje");
    expect(persist.saveSession).toHaveBeenLastCalledWith(
      expect.objectContaining({ id, note: "pesado hoje" }),
    );
  });

  it("remover a sessão apaga as séries dela, e só as dela", () => {
    const { store, persist } = setup();
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
    expect(persist.deleteSession).toHaveBeenCalledWith(id);
  });
});

describe("useWorkoutStore: cardio", () => {
  it("salva sessões e o perfil, e remove sessões", () => {
    const { store, persist } = setup();
    let id = "";
    act(() => {
      id = store.current.addCardioSession({
        speedKmh: 6,
        inclinePct: 2,
        minutes: 30,
        weightKg: 70,
        kcal: 200,
        avgHr: 130,
      }).id;
    });
    expect(store.current.cardioSessions).toHaveLength(1);
    expect(persist.saveCardioSession).toHaveBeenCalledWith(store.current.cardioSessions[0]);
    act(() => store.current.saveCardioProfile({ weightKg: 70, age: 30, sex: "male" }));
    expect(store.current.cardioProfile).toEqual({ weightKg: 70, age: 30, sex: "male" });
    expect(persist.saveCardioProfile).toHaveBeenCalled();
    act(() => store.current.removeCardioSession(id));
    expect(store.current.cardioSessions).toEqual([]);
    expect(persist.deleteCardioSession).toHaveBeenCalledWith(id);
  });
});

describe("useWorkoutStore: geral", () => {
  it("o descanso fica dentro dos limites, e é o valor limitado que vai para o servidor", () => {
    const { store, persist } = setup();
    act(() => store.current.setRestSeconds(-10));
    expect(store.current.restSeconds).toBeGreaterThan(0);
    expect(persist.saveRestSeconds).toHaveBeenCalledWith(store.current.restSeconds);
  });

  it("apagar tudo zera os dados de uma vez", () => {
    const { store, persist } = setup();
    act(() => {
      store.current.addWorkout("Peito", []);
      store.current.addSet("supino-reto", "barbell", "weight", 40, 10);
    });
    act(() => store.current.clearAll());
    expect(store.current.workouts).toEqual([]);
    expect(store.current.sets).toEqual([]);
    expect(store.current.schedule).toEqual({ days: [], rules: [] });
    expect(persist.replaceAllData).toHaveBeenCalledWith(EMPTY_BACKUP);
  });

  it("saving fica ligado até o servidor responder", async () => {
    const { store, persist } = setup();
    let finish = () => {};
    vi.mocked(persist.saveWorkout).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    expect(store.current.saving).toBe(false);
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    expect(store.current.saving).toBe(true);
    await act(async () => finish());
    expect(store.current.saving).toBe(false);
  });

  it("se salvar falhar, avisa com syncError", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { store, persist } = setup();
    vi.mocked(persist.saveWorkout).mockRejectedValueOnce(new Error("offline"));
    act(() => {
      store.current.addWorkout("Peito", []);
    });
    // a tela já mostra o treino; o erro chega depois
    expect(store.current.workouts).toHaveLength(1);
    await waitFor(() => expect(store.current.syncError).toBe(true));
    expect(console.error).toHaveBeenCalled();
  });
});
