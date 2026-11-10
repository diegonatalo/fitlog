import { useState } from "react";
import type { Equipment, Exercise, WorkoutSet } from "@/types";
import { preferredEquipment } from "@/lib/exercises";

/**
 * Which equipment is selected for an exercise. Until the user picks one it
 * follows the most recent set, falling back to the exercise default.
 */
export const useEquipmentChoice = (
  exercise: Exercise,
  latest: WorkoutSet | undefined,
) => {
  const [chosen, setChosen] = useState<Equipment | null>(null);
  const equipment =
    chosen && exercise.equipments.includes(chosen)
      ? chosen
      : preferredEquipment(exercise, latest);
  return [equipment, setChosen] as const;
};
