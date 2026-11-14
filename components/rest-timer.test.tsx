import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RestTimer } from "@/components/rest-timer";

const setup = (duration: number) => {
  const onDurationChange = vi.fn();
  render(
    <RestTimer
      startedAt={Date.now()}
      duration={duration}
      onDurationChange={onDurationChange}
      onDismiss={() => {}}
    />,
  );
  return onDurationChange;
};

describe("RestTimer", () => {
  it("mostra a duração configurada", () => {
    setup(75);
    expect(screen.getByLabelText("Duração do descanso")).toHaveTextContent("01:15");
  });

  it("aumenta e diminui o descanso de 15 em 15 s", async () => {
    const user = userEvent.setup();
    const onChange = setup(90);
    await user.click(screen.getByRole("button", { name: "Aumentar descanso" }));
    expect(onChange).toHaveBeenLastCalledWith(105);
    await user.click(screen.getByRole("button", { name: "Diminuir descanso" }));
    expect(onChange).toHaveBeenLastCalledWith(75);
  });

  it("os atalhos definem o valor direto", async () => {
    const user = userEvent.setup();
    const onChange = setup(90);
    await user.click(screen.getByRole("button", { name: "180s" }));
    expect(onChange).toHaveBeenCalledWith(180);
  });

  it("desabilita os botões nos limites", () => {
    setup(15);
    expect(screen.getByRole("button", { name: "Diminuir descanso" })).toBeDisabled();
  });
});
