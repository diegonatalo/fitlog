import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { useNow } from "@/hooks/use-now";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useStore } from "@/hooks/use-store";
import { useTheme } from "@/hooks/use-theme";
import { useToday } from "@/hooks/use-today";
import { THEME_KEY } from "@/lib/storage";
import type { Exercise, WorkoutSet } from "@/types";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePersistedState", () => {
  const KEY = "fitlog:test:v1";
  const parse = (raw: unknown) => (typeof raw === "number" ? raw : 0);

  it("começa com o valor salvo e grava cada mudança como JSON", () => {
    localStorage.setItem(KEY, "3");
    const { result } = renderHook(() => usePersistedState(KEY, parse));
    expect(result.current[0]).toBe(3);
    act(() => result.current[1](4));
    expect(localStorage.getItem(KEY)).toBe("4");
  });

  it("recarrega quando outra aba muda a mesma chave", () => {
    const { result } = renderHook(() => usePersistedState(KEY, parse));
    act(() => {
      localStorage.setItem(KEY, "9");
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    });
    expect(result.current[0]).toBe(9);
  });

  it("ignora mudanças de outras chaves", () => {
    const { result } = renderHook(() => usePersistedState(KEY, parse));
    act(() => {
      localStorage.setItem(KEY, "7");
      window.dispatchEvent(new StorageEvent("storage", { key: "fitlog:outra:v1" }));
    });
    expect(result.current[0]).toBe(0);
  });

  it("ignora JSON corrompido", () => {
    localStorage.setItem(KEY, "{quebrado");
    const { result } = renderHook(() => usePersistedState(KEY, parse));
    expect(result.current[0]).toBe(0);
  });
});

describe("useTheme", () => {
  const meta = () => document.querySelector('meta[name="theme-color"]');

  beforeEach(() => {
    document.head.innerHTML = '<meta name="theme-color" content="">';
  });

  it("lê o tema aplicado pelo script do layout e não grava nada ao abrir", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("alterna gravando a escolha e atualizando a cor da barra", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(meta()).toHaveAttribute("content", "#14161d");
  });

  it("sem escolha salva acompanha a mudança do sistema", () => {
    let onChange = () => {};
    const media = { matches: true, addEventListener: (_: string, cb: () => void) => (onChange = cb), removeEventListener: () => {} };
    vi.spyOn(window, "matchMedia").mockReturnValue(media as unknown as MediaQueryList);
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useTheme());
    act(() => onChange());
    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });
});

describe("useNow e useToday", () => {
  it("useNow atualiza no intervalo", () => {
    vi.useFakeTimers({ now: 1_000 });
    const { result } = renderHook(() => useNow(500));
    expect(result.current).toBe(1_000);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(1_500);
  });

  it("useToday devolve a data local e vira o dia com o app aberto", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 1, 23, 59, 30) });
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-03-01");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe("2026-03-02");
  });
});

describe("useEquipmentChoice", () => {
  const exercise: Exercise = { id: "supino-reto", name: "Supino reto", muscleGroup: "chest", equipments: ["barbell", "dumbbell"] };
  const latest = { equipment: "dumbbell", loadType: "weight" } as WorkoutSet;

  it("sem escolha, segue a série mais recente ou o padrão do exercício", () => {
    expect(renderHook(() => useEquipmentChoice(exercise, latest)).result.current[0]).toBe("dumbbell");
    expect(renderHook(() => useEquipmentChoice(exercise, undefined)).result.current[0]).toBe("barbell");
  });

  it("a escolha da pessoa vale, se o exercício aceitar o equipamento", () => {
    const { result } = renderHook(() => useEquipmentChoice(exercise, undefined));
    act(() => result.current[1]("dumbbell"));
    expect(result.current[0]).toBe("dumbbell");
    act(() => result.current[1]("cable"));
    expect(result.current[0]).toBe("barbell");
  });
});

describe("useStore", () => {
  it("avisa quando usado fora do provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useStore())).toThrow("useStore must be used inside <StoreProvider>");
  });
});
