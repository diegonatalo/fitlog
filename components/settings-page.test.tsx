import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Store } from "@/hooks/use-workout-store";
import { StoreContext } from "@/hooks/use-store";

vi.mock("@/components/cardio-profile-form", () => ({ CardioProfileForm: () => null }));
vi.mock("@/components/account-section", () => ({ AccountSection: () => null }));

import { SettingsPage } from "./settings-page";

const setup = () => {
  const store = { sets: [], finishedSessions: [], clearAll: vi.fn() };
  render(
    <StoreContext value={store as unknown as Store}>
      <SettingsPage />
    </StoreContext>,
  );
  return { store };
};

describe("SettingsPage", () => {
  it("não oferece mais exportar nem importar backup", () => {
    setup();
    expect(screen.queryByRole("button", { name: /backup/i })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("apagar tudo pede confirmação, com o foco no Cancelar", async () => {
    const { store } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Apagar todos os dados" }));
    expect(screen.getByRole("alertdialog", { name: "Apagar todos os dados?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(store.clearAll).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Apagar todos os dados" }));
    await userEvent.click(screen.getByRole("button", { name: "Apagar tudo" }));
    expect(store.clearAll).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Dados apagados.");
  });

  it("escolhe o tema e pode voltar a seguir o sistema", async () => {
    localStorage.clear();
    setup();
    const group = screen.getByRole("radiogroup", { name: "Tema" });
    expect(screen.getByRole("radio", { name: "Sistema" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "Escuro" }));
    expect(screen.getByRole("radio", { name: "Escuro" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveClass("dark");
    await userEvent.click(screen.getByRole("radio", { name: "Sistema" }));
    expect(screen.getByRole("radio", { name: "Sistema" })).toHaveAttribute("aria-checked", "true");
    expect(group).toBeInTheDocument();
  });
});
