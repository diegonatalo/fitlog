import { describe, expect, it } from "vitest";
import {
  EXERCISES,
  getExercise,
  preferredEquipment,
  setEquipment,
  setsForEquipment,
} from "@/lib/exercises";
import { DEFAULT_WORKOUTS } from "@/lib/defaults";
import { equipmentMeta } from "@/types";
import type { WorkoutSet } from "@/types";

const supino = getExercise("ex-supino-reto")!;

const set = (patch: Partial<WorkoutSet>): WorkoutSet => ({
  id: "s",
  exerciseId: supino.id,
  loadType: "weight",
  load: 40,
  reps: 10,
  createdAt: 1,
  ...patch,
});

describe("catálogo", () => {
  it("tem ids únicos e ao menos um equipamento por exercício", () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    for (const e of EXERCISES) expect(e.equipments.length).toBeGreaterThan(0);
  });

  it("não repete equipamento dentro do mesmo exercício", () => {
    for (const e of EXERCISES) {
      expect(new Set(e.equipments).size).toBe(e.equipments.length);
    }
  });

  it("supino oferece barra, halter e máquina", () => {
    expect(supino.equipments).toEqual(
      expect.arrayContaining(["barbell", "dumbbell", "machine"]),
    );
  });

  it("barra e halter pedem kg; máquina e polia pedem placas", () => {
    expect(equipmentMeta("barbell").loadType).toBe("weight");
    expect(equipmentMeta("dumbbell").loadType).toBe("weight");
    expect(equipmentMeta("machine").loadType).toBe("plates");
    expect(equipmentMeta("cable").loadType).toBe("plates");
  });

  it("os treinos padrão só usam exercícios do catálogo", () => {
    for (const w of DEFAULT_WORKOUTS) {
      for (const id of w.exerciseIds) expect(getExercise(id)).toBeDefined();
    }
  });

  it("getExercise devolve undefined para id desconhecido", () => {
    expect(getExercise("ex-nao-existe")).toBeUndefined();
  });
});

describe("setEquipment", () => {
  it("usa o equipamento gravado na série", () => {
    expect(setEquipment(set({ equipment: "dumbbell" }), supino)).toBe("dumbbell");
  });

  it("série antiga deduz o equipamento pelo tipo de carga", () => {
    expect(setEquipment(set({ loadType: "plates" }), supino)).toBe("machine");
    expect(setEquipment(set({ loadType: "weight" }), supino)).toBe("barbell");
  });

  it("equipamento que não existe mais no exercício cai no padrão", () => {
    expect(setEquipment(set({ equipment: "time" }), supino)).toBe("barbell");
  });
});

describe("setsForEquipment e preferredEquipment", () => {
  const sets = [
    set({ id: "a", equipment: "barbell" }),
    set({ id: "b", equipment: "dumbbell" }),
    set({ id: "c", equipment: "barbell" }),
  ];

  it("filtra as séries do equipamento", () => {
    expect(setsForEquipment(sets, supino, "barbell").map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("pré-seleciona o equipamento da última série, ou o padrão", () => {
    expect(preferredEquipment(supino, sets[1])).toBe("dumbbell");
    expect(preferredEquipment(supino, undefined)).toBe("barbell");
  });
});
