import type { Workout } from "@/types";

const BASE = Date.now();

const workout = (id: string, name: string, exerciseIds: string[]): Workout => ({
  id: `wk-${id}`,
  name,
  exerciseIds,
  createdAt: BASE,
});

export const DEFAULT_WORKOUTS: Workout[] = [
  workout("push", "Push", [
    "ex-supino-reto",
    "ex-voador",
    "ex-elevacao-lateral",
    "ex-triceps-corda",
    "ex-triceps-frances",
  ]),
  workout("pull", "Pull", [
    "ex-puxador-frente-barra",
    "ex-remada-baixa",
    "ex-face-pull",
    "ex-rosca-direta",
    "ex-rosca-scott",
  ]),
  workout("legs", "Legs", [
    "ex-agachamento-smith",
    "ex-elevacao-pelvica",
    "ex-cadeira-flexora",
    "ex-cadeira-extensora",
    "ex-cadeira-adutora",
    "ex-panturrilha",
  ]),
];
