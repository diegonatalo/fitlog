import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeChoice } from "@/hooks/use-theme-choice";

const KEY = "fitlog:theme:v1";
const COLORS = { light: "#ffffff", dark: "#000000" };
const isDark = () => document.documentElement.classList.contains("dark");

const systemIsDark = (matches: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as MediaQueryList);

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => vi.restoreAllMocks());

describe("useThemeChoice", () => {
  it("sem escolha salva, segue o sistema", () => {
    systemIsDark(false);
    const { result } = renderHook(() => useThemeChoice(KEY, COLORS));
    expect(result.current.choice).toBe("system");
  });

  it("fixa um tema e grava a escolha", () => {
    systemIsDark(false);
    const { result } = renderHook(() => useThemeChoice(KEY, COLORS));
    act(() => result.current.setChoice("dark"));
    expect(result.current.choice).toBe("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
    expect(isDark()).toBe(true);
  });

  it("voltar ao sistema apaga a escolha e aplica o tema do aparelho", () => {
    systemIsDark(true);
    const { result } = renderHook(() => useThemeChoice(KEY, COLORS));
    act(() => result.current.setChoice("light"));
    expect(isDark()).toBe(false);

    act(() => result.current.setChoice("system"));
    expect(result.current.choice).toBe("system");
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(isDark()).toBe(true);
  });
});
