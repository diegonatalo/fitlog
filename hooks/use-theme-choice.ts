import { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "@/hooks/use-theme";
import { parseTheme, type Theme, type ThemeColors } from "@/lib/theme";

/** O que a pessoa escolheu: um tema fixo ou seguir o sistema. */
export type ThemeChoice = Theme | "system";

// o mesmo evento que hooks/use-theme.ts dispara ao trocar o tema (o hook é do modelo e fica igual a ele)
const CHANGE_EVENT = "theme:change";

const readChoice = (key: string): ThemeChoice => {
  try {
    return parseTheme(localStorage.getItem(key)) ?? "system";
  } catch {
    return "system";
  }
};

/**
 * Escolha de tema com a opção de seguir o sistema, sobre o `useTheme` do modelo.
 * "system" apaga a escolha salva; o `useTheme` então volta a acompanhar o aparelho.
 */
export const useThemeChoice = (key: string, colors?: ThemeColors) => {
  const { setTheme } = useTheme(key, colors);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(CHANGE_EVENT, onChange);
      };
    },
    [key],
  );

  const choice = useSyncExternalStore(
    subscribe,
    () => readChoice(key),
    (): ThemeChoice => "system",
  );

  const setChoice = useCallback(
    (next: ThemeChoice) => {
      if (next !== "system") return setTheme(next);
      try {
        localStorage.removeItem(key);
      } catch {
        // Armazenamento bloqueado: não havia escolha salva para apagar.
      }
      // o useTheme escuta "storage" e reaplica o tema do sistema
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key, setTheme],
  );

  return { choice, setChoice };
};
