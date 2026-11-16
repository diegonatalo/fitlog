import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Workout } from "@/types";
import type { Store } from "@/hooks/use-workout-store";
import { StoreContext } from "@/hooks/use-store";
import { WorkoutsPage } from "@/components/workouts-page";

const renderWith = (workouts: Workout[]) =>
  render(
    <StoreContext value={{ workouts } as unknown as Store}>
      <WorkoutsPage />
    </StoreContext>,
  );

const workout = (id: string, name: string, exerciseIds: string[]): Workout => ({
  id,
  name,
  exerciseIds,
  createdAt: 1,
});

describe("WorkoutsPage", () => {
  it("lista os treinos com contagem de exercícios e link para cada um", () => {
    renderWith([
      workout("a", "Push", ["ex-supino-reto", "ex-voador"]),
      workout("b", "Vazio", []),
    ]);
    const push = screen.getByRole("link", { name: /Push/ });
    expect(push).toHaveAttribute("href", "/treino/a");
    expect(push).toHaveTextContent("2 exercícios");
    expect(push).toHaveTextContent("Peito");
    expect(screen.getByRole("link", { name: /Vazio/ })).toHaveTextContent(
      "Sem exercícios ainda",
    );
  });

  it("oferece criar treino quando já existem treinos", () => {
    renderWith([workout("a", "Push", [])]);
    expect(screen.getByRole("link", { name: /Criar treino/ })).toHaveAttribute(
      "href",
      "/treino/novo",
    );
  });

  it("sem treinos, mostra o estado vazio com a ação de criar", () => {
    renderWith([]);
    expect(screen.getByText("Monte seu primeiro treino")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar treino/ })).toHaveAttribute(
      "href",
      "/treino/novo",
    );
  });

  it("sempre leva à lista de exercícios", () => {
    renderWith([]);
    expect(screen.getByRole("link", { name: /Ver exercícios/ })).toHaveAttribute(
      "href",
      "/biblioteca",
    );
  });
});
