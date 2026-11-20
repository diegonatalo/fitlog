import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodayCard, type TodayPlan } from "@/components/today-card";

const workout: TodayPlan = {
  kind: "workout",
  name: "Push",
  exercises: 5,
  groups: ["chest", "triceps"],
};

const setup = (
  plan: TodayPlan,
  extra: { doneToday?: boolean; busy?: boolean } = {},
) => {
  const onStart = vi.fn();
  const onStartFree = vi.fn();
  render(
    <TodayCard
      plan={plan}
      doneToday={extra.doneToday ?? false}
      busy={extra.busy ?? false}
      onStart={onStart}
      onStartFree={onStartFree}
    />,
  );
  return { onStart, onStartFree };
};

describe("TodayCard", () => {
  it("mostra o treino do dia e inicia ao clicar", async () => {
    const { onStart } = setup(workout);
    expect(screen.getByText("Push")).toBeInTheDocument();
    expect(screen.getByText("5 exercícios")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /iniciar treino/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("avisa quando o treino de hoje já foi feito", () => {
    setup(workout, { doneToday: true });
    expect(screen.getByText("Treino de hoje feito")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Treinar de novo" })).toBeEnabled();
  });

  it("não deixa iniciar com outro treino em andamento", () => {
    setup(workout, { busy: true });
    expect(
      screen.getByRole("button", { name: "Outro treino em andamento" }),
    ).toBeDisabled();
  });

  it("não deixa iniciar um treino sem exercícios", () => {
    setup({ ...workout, exercises: 0 } as TodayPlan);
    expect(screen.getByRole("button", { name: /iniciar treino/i })).toBeDisabled();
  });

  it("mostra o dia de descanso, sem botão de iniciar", () => {
    setup({ kind: "rest" });
    expect(screen.getByText("Dia de descanso")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("sem plano, oferece agenda e treino livre", async () => {
    const { onStartFree } = setup(null);
    expect(screen.getByText("Nada planejado para hoje")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /planejar na agenda/i })).toHaveAttribute(
      "href",
      "/app/agenda",
    );
    await userEvent.click(screen.getByRole("button", { name: /treino livre/i }));
    expect(onStartFree).toHaveBeenCalledTimes(1);
  });
});
