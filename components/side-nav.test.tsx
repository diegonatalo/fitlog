import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Store } from "@/hooks/use-workout-store";
import { AccountContext, StoreContext } from "@/hooks/use-store";
import type { Workout, WorkoutSession } from "@/types";

const navigate = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/app/agenda" }));
vi.mock("@/lib/router", () => ({ useNavigate: () => navigate }));
vi.mock("@/hooks/use-today", () => ({ useToday: () => "2026-11-24" }));

import { SideNav } from "./side-nav";

const workout: Workout = { id: "w1", name: "Treino A", exerciseIds: [], createdAt: 1 };
const session = (id: string): WorkoutSession => ({ id, workoutId: null, name: "Treino", startedAt: 1, finishedAt: null });

const setup = (activeSession: WorkoutSession | null = null) => {
  const startSession = vi.fn(() => session("nova"));
  const store = {
    activeSession,
    workouts: [workout],
    schedule: { days: [{ date: "2026-11-24", plan: { type: "workout", workoutId: "w1" } }], rules: [] },
    startSession,
  } as unknown as Store;
  const onToggleTheme = vi.fn();
  render(
    <StoreContext value={store}>
      <AccountContext value={{ id: "u1", name: "Diego", email: "diego@exemplo.com" }}>
        <SideNav theme="dark" onToggleTheme={onToggleTheme} />
      </AccountContext>
    </StoreContext>,
  );
  return { startSession, onToggleTheme };
};

describe("SideNav", () => {
  beforeEach(() => navigate.mockClear());

  it("marca a página atual e mostra a conta", () => {
    setup();
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("diego@exemplo.com")).toBeInTheDocument();
  });

  it("inicia o treino planejado para hoje e abre a sessão", async () => {
    const { startSession } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    expect(startSession).toHaveBeenCalledWith(workout);
    expect(navigate).toHaveBeenCalledWith("/app/sessao/nova");
  });

  it("com um treino em andamento, só volta para ele", async () => {
    const { startSession } = setup(session("atual"));
    await userEvent.click(screen.getByRole("button", { name: "Continuar treino" }));
    expect(startSession).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/app/sessao/atual");
  });

  it("troca o tema", async () => {
    const { onToggleTheme } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Ativar tema claro" }));
    expect(onToggleTheme).toHaveBeenCalled();
  });
});
