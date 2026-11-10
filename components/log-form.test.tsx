import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Equipment } from "@/types";
import { LogForm } from "@/components/log-form";

const Harness = ({ onSave }: { onSave: (load: number, reps: number) => void }) => {
  const [equipment, setEquipment] = useState<Equipment>("barbell");
  return (
    <LogForm
      equipments={["barbell", "dumbbell", "machine"]}
      equipment={equipment}
      onEquipmentChange={setEquipment}
      onSave={onSave}
    />
  );
};

describe("LogForm", () => {
  it("pede kg para barra e placas para máquina", async () => {
    const user = userEvent.setup();
    render(<Harness onSave={() => {}} />);
    expect(screen.getByText("Peso (kg)")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Máquina" }));
    expect(screen.getByText("Placas")).toBeInTheDocument();
    expect(screen.queryByText("Peso (kg)")).not.toBeInTheDocument();
  });

  it("não mostra o seletor quando há um único equipamento", () => {
    render(
      <LogForm
        equipments={["machine"]}
        equipment="machine"
        onEquipmentChange={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("só salva com carga e repetições válidas", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<Harness onSave={onSave} />);
    const save = screen.getByRole("button", { name: /salvar/i });
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText("Peso (kg)"), "40");
    await user.type(screen.getByLabelText("Repetições"), "8");
    await user.click(save);
    expect(onSave).toHaveBeenCalledWith(40, 8);
  });
});
