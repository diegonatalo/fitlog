"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "@/hooks/use-theme";
import { THEME_COLORS, THEME_KEY } from "@/lib/storage";

/** Troca de tema fora do app (landing e páginas legais). */
export const LandingThemeToggle = ({ className = "text-foreground hover:bg-muted" }: { className?: string }) => {
  const { theme, toggle } = useTheme(THEME_KEY, THEME_COLORS);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`grid size-9 place-items-center rounded-full transition-colors ${className}`}
    >
      {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  );
};
