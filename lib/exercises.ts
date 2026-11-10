import type {
  Equipment,
  Exercise,
  MuscleGroup,
  WorkoutSet,
} from "@/types";
import { equipmentMeta } from "@/types";

const ex = (
  slug: string,
  name: string,
  muscleGroup: MuscleGroup,
  equipments: Equipment[],
): Exercise => ({ id: `ex-${slug}`, name, muscleGroup, equipments });

/**
 * Every exercise the app knows. Ids are stable: logged sets point at them.
 * Free weights ask for kg, machines and cables ask for plates.
 */
export const EXERCISES: Exercise[] = [
  // Peito
  ex("supino-reto", "Supino reto", "chest", ["barbell", "dumbbell", "machine", "smith"]),
  ex("supino-inclinado", "Supino inclinado", "chest", ["barbell", "dumbbell", "machine", "smith"]),
  ex("supino-declinado", "Supino declinado", "chest", ["barbell", "dumbbell", "machine"]),
  ex("voador", "Voador", "chest", ["machine"]),
  ex("crucifixo", "Crucifixo", "chest", ["dumbbell", "cable", "machine"]),
  ex("crucifixo-inclinado", "Crucifixo inclinado", "chest", ["dumbbell", "cable"]),
  ex("crossover", "Crossover", "chest", ["cable"]),
  ex("pullover", "Pullover", "chest", ["dumbbell", "cable"]),
  ex("flexao-de-braco", "Flexão de braço", "chest", ["bodyweight"]),
  ex("paralelas", "Mergulho nas paralelas", "chest", ["bodyweight", "machine"]),

  // Costas
  ex("barra-fixa", "Barra fixa", "back", ["bodyweight", "machine"]),
  ex("puxador-frente-barra", "Puxador frente (barra)", "back", ["cable", "machine"]),
  ex("puxador-frente-triangulo", "Puxador frente (triângulo)", "back", ["cable", "machine"]),
  ex("puxador-supinado", "Puxador supinado", "back", ["cable", "machine"]),
  ex("pulldown", "Pulldown (corda)", "back", ["cable"]),
  ex("remada-curvada", "Remada curvada", "back", ["barbell", "dumbbell", "smith"]),
  ex("remada-unilateral", "Remada unilateral (serrote)", "back", ["dumbbell", "cable"]),
  ex("remada-cavalinho", "Remada cavalinho", "back", ["barbell", "machine"]),
  ex("remada-baixa", "Remada baixa", "back", ["cable", "machine"]),
  ex("remada-alta", "Remada alta", "back", ["cable", "machine", "barbell"]),
  ex("remada-articulada", "Remada articulada", "back", ["machine"]),
  ex("levantamento-terra", "Levantamento terra", "back", ["barbell", "dumbbell", "smith"]),
  ex("hiperextensao", "Hiperextensão lombar", "back", ["bodyweight", "machine"]),
  ex("encolhimento", "Encolhimento (trapézio)", "back", ["barbell", "dumbbell", "smith", "machine"]),

  // Ombros
  ex("desenvolvimento", "Desenvolvimento", "shoulders", ["dumbbell", "barbell", "machine", "smith"]),
  ex("arnold-press", "Arnold press", "shoulders", ["dumbbell"]),
  ex("elevacao-lateral", "Elevação lateral", "shoulders", ["dumbbell", "cable", "machine"]),
  ex("elevacao-frontal", "Elevação frontal", "shoulders", ["dumbbell", "barbell", "cable"]),
  ex("crucifixo-inverso", "Crucifixo inverso", "shoulders", ["dumbbell", "cable", "machine"]),
  ex("face-pull", "Face pull", "shoulders", ["cable"]),

  // Bíceps
  ex("rosca-direta", "Rosca direta", "biceps", ["barbell", "dumbbell", "cable"]),
  ex("rosca-alternada", "Rosca alternada", "biceps", ["dumbbell"]),
  ex("rosca-martelo", "Rosca martelo", "biceps", ["dumbbell", "cable"]),
  ex("rosca-scott", "Rosca scott", "biceps", ["barbell", "dumbbell", "machine"]),
  ex("rosca-concentrada", "Rosca concentrada", "biceps", ["dumbbell"]),
  ex("rosca-inclinada", "Rosca inclinada", "biceps", ["dumbbell"]),
  ex("rosca-inversa", "Rosca inversa", "biceps", ["barbell", "cable"]),

  // Tríceps
  ex("triceps-corda", "Tríceps corda", "triceps", ["cable"]),
  ex("triceps-pulley", "Tríceps pulley (barra)", "triceps", ["cable"]),
  ex("triceps-frances", "Tríceps francês", "triceps", ["dumbbell", "barbell", "cable"]),
  ex("triceps-testa", "Tríceps testa", "triceps", ["barbell", "dumbbell", "cable"]),
  ex("triceps-coice", "Tríceps coice", "triceps", ["dumbbell", "cable"]),
  ex("supino-fechado", "Supino fechado", "triceps", ["barbell", "smith"]),
  ex("mergulho-banco", "Mergulho no banco", "triceps", ["bodyweight"]),
  ex("triceps-maquina", "Tríceps na máquina", "triceps", ["machine"]),

  // Pernas
  ex("agachamento-livre", "Agachamento livre", "legs", ["barbell", "dumbbell"]),
  ex("agachamento-smith", "Agachamento no smith", "legs", ["smith"]),
  ex("agachamento-bulgaro", "Agachamento búlgaro", "legs", ["dumbbell", "smith", "barbell"]),
  ex("hack", "Hack", "legs", ["machine"]),
  ex("leg-press-45", "Leg press 45°", "legs", ["machine"]),
  ex("leg-press-horizontal", "Leg press horizontal", "legs", ["machine"]),
  ex("cadeira-extensora", "Cadeira extensora", "legs", ["machine"]),
  ex("cadeira-flexora", "Cadeira flexora", "legs", ["machine"]),
  ex("mesa-flexora", "Mesa flexora", "legs", ["machine"]),
  ex("cadeira-adutora", "Cadeira adutora", "legs", ["machine"]),
  ex("afundo", "Afundo", "legs", ["dumbbell", "barbell", "smith"]),
  ex("passada", "Passada", "legs", ["dumbbell", "barbell"]),
  ex("stiff", "Stiff", "legs", ["barbell", "dumbbell", "smith"]),
  ex("panturrilha", "Panturrilha em pé", "legs", ["machine", "smith", "bodyweight"]),
  ex("panturrilha-sentado", "Panturrilha sentado", "legs", ["machine"]),

  // Glúteos
  ex("elevacao-pelvica", "Elevação pélvica", "glutes", ["barbell", "machine", "smith", "bodyweight"]),
  ex("gluteo-polia", "Glúteo na polia (coice)", "glutes", ["cable"]),
  ex("gluteo-maquina", "Glúteo na máquina", "glutes", ["machine"]),
  ex("cadeira-abdutora", "Cadeira abdutora", "glutes", ["machine"]),
  ex("agachamento-sumo", "Agachamento sumô", "glutes", ["dumbbell", "barbell"]),

  // Abdômen
  ex("abdomen-supra", "Abdominal supra", "abs", ["bodyweight", "cable", "machine"]),
  ex("abdomen-infra", "Abdominal infra", "abs", ["bodyweight"]),
  ex("abdomen-obliquo", "Abdominal oblíquo", "abs", ["bodyweight", "cable"]),
  ex("elevacao-pernas", "Elevação de pernas", "abs", ["bodyweight"]),
  ex("prancha", "Prancha", "abs", ["time"]),
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

/** The equipment a stored set was performed with (legacy sets have none). */
export function setEquipment(set: WorkoutSet, exercise: Exercise): Equipment {
  if (set.equipment && exercise.equipments.includes(set.equipment)) {
    return set.equipment;
  }
  return (
    exercise.equipments.find(
      (e) => equipmentMeta(e).loadType === set.loadType,
    ) ?? exercise.equipments[0]
  );
}

export function setsForEquipment(
  sets: WorkoutSet[],
  exercise: Exercise,
  equipment: Equipment,
): WorkoutSet[] {
  return sets.filter((s) => setEquipment(s, exercise) === equipment);
}

/** Equipment to preselect: the one used last, else the exercise default. */
export function preferredEquipment(
  exercise: Exercise,
  latest: WorkoutSet | undefined,
): Equipment {
  return latest ? setEquipment(latest, exercise) : exercise.equipments[0];
}
