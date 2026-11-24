"use client";

import { useThemeChoice, type ThemeChoice as Choice } from "@/hooks/use-theme-choice";
import { THEME_COLORS, THEME_KEY } from "@/lib/storage";
import { cn } from "@/lib/cn";

const OPTIONS: { value: Choice; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

/** Tema do app: seguir o sistema ou fixar claro ou escuro. */
export const ThemeChoice = () => {
  const { choice, setChoice } = useThemeChoice(THEME_KEY, THEME_COLORS);
  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-1 rounded-[14px] bg-background p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={choice === o.value}
          onClick={() => setChoice(o.value)}
          className={cn(
            "h-10 rounded-[10px] text-sm transition-colors",
            choice === o.value
              ? "bg-muted font-extrabold text-foreground"
              : "font-semibold text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
