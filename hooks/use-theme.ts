import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/storage";

type Theme = "light" | "dark";

const THEME_COLORS: Record<Theme, string> = {
  dark: "#14161d",
  light: "#f4f6f9",
};

const CHANGE_EVENT = "fitlog:theme-change";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

const readChoice = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
};

const systemTheme = (): Theme =>
  window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";

/** Tema em uso: a classe dark do <html>, aplicada pelo script do layout antes da primeira pintura. */
const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(LIGHT_QUERY);
  // Sem escolha salva, acompanha o sistema.
  const onSystemChange = () => {
    if (readChoice() === null) applyTheme(systemTheme());
    onChange();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

/** Só grava no armazenamento quando o usuário alterna; sem escolha, segue o sistema. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, getSnapshot, () => "dark");

  const toggle = () => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Armazenamento bloqueado: o tema vale só nesta visita.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { theme, toggle };
}
