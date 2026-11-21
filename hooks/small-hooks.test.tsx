import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { useNow } from "@/hooks/use-now";
import { useAccount, useStore } from "@/hooks/use-store";
import type { Exercise, WorkoutSet } from "@/types";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useNow", () => {
  it("useNow atualiza no intervalo", () => {
    vi.useFakeTimers({ now: 1_000 });
    const { result } = renderHook(() => useNow(500));
    expect(result.current).toBe(1_000);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(1_500);
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

  it("useAccount também avisa fora do provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAccount())).toThrow("useAccount must be used inside <StoreProvider>");
  });
});
