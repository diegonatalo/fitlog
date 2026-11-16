import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Store } from "@/hooks/use-workout-store";
import { buildBackup } from "@/lib/schema";
import { StoreContext } from "@/hooks/use-store";

vi.mock("@/components/cardio-profile-form", () => ({ CardioProfileForm: () => null }));

import { SettingsPage } from "./settings-page";

const workout = { id: "w", name: "Push", exerciseIds: [], createdAt: 1 };

const setup = () => {
  const store = {
    sets: [],
    workouts: [workout],
    sessions: [],
    finishedSessions: [],
    cardioSessions: [],
    cardioProfile: null,
    schedule: { days: [], rules: [] },
    replaceAll: vi.fn(),
    clearAll: vi.fn(),
  };
  const { container } = render(
    <StoreContext value={store as unknown as Store}>
      <SettingsPage />
    </StoreContext>,
  );
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  return { store, fileInput };
};

const file = (content: string) => new File([content], "backup.json", { type: "application/json" });

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:fitlog");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe("SettingsPage", () => {
  it("exporta o backup como arquivo e avisa", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Exportar backup" }));
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fitlog");
    expect(screen.getByRole("status")).toHaveTextContent("Backup exportado.");
  });

  it("importar um backup válido pede confirmação e substitui os dados", async () => {
    const { store, fileInput } = setup();
    const backup = buildBackup({
      sets: [],
      workouts: [workout, { ...workout, id: "w2" }],
      sessions: [],
      cardioSessions: [],
      cardioProfile: null,
      schedule: { days: [], rules: [] },
    });
    await userEvent.upload(fileInput, file(backup));
    const dialog = await screen.findByRole("alertdialog", { name: "Substituir seus dados?" });
    expect(dialog).toHaveTextContent("O backup tem 2 treinos e 0 séries.");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));
    expect(store.replaceAll).toHaveBeenCalledWith(expect.objectContaining({ workouts: expect.any(Array) }));
    expect(screen.getByRole("status")).toHaveTextContent("Backup importado com sucesso.");
  });

  it("arquivo que não é backup mostra o erro e não abre a confirmação", async () => {
    const { store, fileInput } = setup();
    await userEvent.upload(fileInput, file('{"app":"outro"}'));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Este arquivo não é um backup do FitLog."));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(store.replaceAll).not.toHaveBeenCalled();
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
});
