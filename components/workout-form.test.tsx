import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Store } from "@/hooks/use-workout-store";
import { StoreContext } from "@/hooks/use-store";
import type { Workout } from "@/types";

const router = vi.hoisted(() => ({
  params: {} as { id?: string },
  navigate: vi.fn(),
}));
vi.mock("@/lib/router", () => ({
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  Navigate: ({ to }: { to: string }) => <p>redirecionado para {to}</p>,
}));

import { WorkoutForm } from "./workout-form";

const push: Workout = { id: "w1", name: "Push", exerciseIds: ["ex-supino-reto", "ex-crucifixo"], createdAt: 1 };

const setup = (workouts: Workout[] = []) => {
  const store = {
    workouts,
    addWorkout: vi.fn((name: string, exerciseIds: string[]) => ({ id: "novo", name, exerciseIds, createdAt: 2 })),
    updateWorkout: vi.fn(),
  };
  render(
    <StoreContext value={store as unknown as Store}>
      <WorkoutForm />
    </StoreContext>,
  );
  return store;
};

/** Botão da biblioteca pelo nome exato do exercício (o nome acessível inclui o grupo muscular). */
const libraryButton = (name: string) =>
  screen.getAllByRole("button").find((b) => b.querySelector(".font-semibold")?.textContent === name)!;

beforeEach(() => {
  router.params = {};
  router.navigate.mockReset();
});

describe("WorkoutForm (novo)", () => {
  it("sem nome não deixa criar", () => {
    setup();
    expect(screen.getByRole("button", { name: "Criar treino" })).toBeDisabled();
  });

  it("monta o treino com os exercícios escolhidos, na ordem, e abre o treino criado", async () => {
    const store = setup();
    await userEvent.type(screen.getByLabelText("Nome do treino"), "Peito");
    await userEvent.click(libraryButton("Supino reto"));
    await userEvent.click(libraryButton("Crucifixo"));
    expect(screen.getByText("2 exercícios")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Subir Crucifixo" }));
    await userEvent.click(screen.getByRole("button", { name: "Criar treino" }));
    expect(store.addWorkout).toHaveBeenCalledWith("Peito", ["ex-crucifixo", "ex-supino-reto"]);
    expect(router.navigate).toHaveBeenCalledWith("/app/treino/novo", { replace: true });
  });

  it("a busca filtra a biblioteca", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Buscar exercício"), "supino");
    const names = screen
      .getAllByRole("button", { pressed: false })
      .map((b) => b.textContent ?? "")
      .filter(Boolean);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.toLowerCase().includes("supino"))).toBe(true);
  });

  it("clicar de novo no exercício tira ele do treino", async () => {
    setup();
    const supino = libraryButton("Supino reto");
    await userEvent.click(supino);
    expect(supino).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Remover Supino reto" }));
    expect(supino).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("Ordem do treino")).toBeNull();
  });
});

describe("WorkoutForm (editando)", () => {
  it("carrega o treino, salva as mudanças e volta", async () => {
    router.params = { id: "w1" };
    const store = setup([push]);
    expect(screen.getByLabelText("Nome do treino")).toHaveValue("Push");
    expect(screen.getByRole("button", { name: "Subir Supino reto" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Descer Supino reto" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar treino" }));
    expect(store.updateWorkout).toHaveBeenCalledWith("w1", { name: "Push", exerciseIds: ["ex-crucifixo", "ex-supino-reto"] });
    expect(router.navigate).toHaveBeenCalledWith(-1);
  });

  it("treino que não existe redireciona para a lista", () => {
    router.params = { id: "sumiu" };
    setup([push]);
    expect(screen.getByText("redirecionado para /app/treinos")).toBeInTheDocument();
  });
});
