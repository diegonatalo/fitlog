import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Store } from "@/hooks/use-workout-store";
import { estimate } from "@/lib/cardio";
import { StoreContext } from "@/hooks/use-store";
import type { CardioProfile, CardioSession } from "@/types";

vi.mock("@/lib/router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
}));
vi.mock("@/components/cardio-chart", () => ({ CardioChart: () => null }));

import { CardioPage } from "./cardio-page";

const profile: CardioProfile = { weightKg: 80, age: 30, sex: "male" };

const setup = (cardioProfile: CardioProfile | null, cardioSessions: CardioSession[] = []) => {
  const store = { cardioProfile, cardioSessions, addCardioSession: vi.fn() };
  render(
    <StoreContext value={store as unknown as Store}>
      <CardioPage />
    </StoreContext>,
  );
  return store;
};

describe("CardioPage", () => {
  it("sem perfil, pede para preencher e não mostra estimativa", () => {
    setup(null);
    expect(screen.getByRole("link", { name: "Preencher perfil" })).toHaveAttribute("href", "/app/ajustes");
    expect(screen.queryByText("Calorias")).toBeNull();
  });

  it("com perfil, mostra a estimativa dos valores padrão", () => {
    setup(profile);
    const result = estimate({ speedKmh: 6, inclinePct: 5, minutes: 30 }, profile);
    expect(screen.getByText("80 kg · 30 anos · masc.")).toBeInTheDocument();
    expect(screen.getByText(String(result.kcal))).toBeInTheDocument();
    expect(screen.getByText(`Zona ${result.zone.id} · ${result.zone.label}`)).toBeInTheDocument();
  });

  it("começa com os valores da última sessão", () => {
    setup(profile, [
      { id: "c", speedKmh: 8, inclinePct: 2, minutes: 20, weightKg: 80, kcal: 1, avgHr: 1, createdAt: 1 },
    ]);
    expect(screen.getByLabelText("Velocidade (km/h)")).toHaveValue(8);
    expect(screen.getByLabelText("Tempo (min)")).toHaveValue(20);
  });

  it("valores fora dos limites escondem a estimativa", () => {
    setup(profile);
    fireEvent.change(screen.getByLabelText("Velocidade (km/h)"), { target: { value: "40" } });
    expect(screen.queryByText("Calorias")).toBeNull();
  });

  it("salvar registra a sessão com a estimativa e confirma", async () => {
    const store = setup(profile);
    fireEvent.change(screen.getByLabelText("Tempo (min)"), { target: { value: "45" } });
    const result = estimate({ speedKmh: 6, inclinePct: 5, minutes: 45 }, profile);
    await userEvent.click(screen.getByRole("button", { name: "Salvar sessão" }));
    expect(store.addCardioSession).toHaveBeenCalledWith({
      speedKmh: 6,
      inclinePct: 5,
      minutes: 45,
      weightKg: 80,
      kcal: result.kcal,
      avgHr: result.avgHr,
    });
    expect(screen.getByRole("button", { name: "Salvo no histórico!" })).toBeInTheDocument();
  });
});
