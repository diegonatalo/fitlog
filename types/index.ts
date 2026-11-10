export type LoadType = "weight" | "plates" | "bodyweight" | "time";

export type LoadTypeMeta = {
  value: LoadType;
  /** short label used in the toggle */
  label: string;
  /** label of the load input */
  loadLabel: string;
  /** unit shown next to a stored load */
  unit: string;
  /** increment of the +/- stepper */
  step: number;
  /** whether a load of 0 is a valid entry (e.g. bodyweight only) */
  allowZero: boolean;
  /** time-based exercises have no repetitions */
  hasReps: boolean;
};

export const LOAD_TYPES: LoadTypeMeta[] = [
  {
    value: "weight",
    label: "Peso",
    loadLabel: "Peso (kg)",
    unit: "kg",
    step: 2.5,
    allowZero: false,
    hasReps: true,
  },
  {
    value: "plates",
    label: "Placas",
    loadLabel: "Placas",
    unit: "placas",
    step: 1,
    allowZero: false,
    hasReps: true,
  },
  {
    value: "bodyweight",
    label: "Corporal",
    loadLabel: "Carga extra (kg)",
    unit: "kg",
    step: 2.5,
    allowZero: true,
    hasReps: true,
  },
  {
    value: "time",
    label: "Tempo",
    loadLabel: "Minutos",
    unit: "min",
    step: 1,
    allowZero: false,
    hasReps: false,
  },
];

export function loadTypeMeta(value: LoadType): LoadTypeMeta {
  return LOAD_TYPES.find((t) => t.value === value) ?? LOAD_TYPES[0];
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "glutes"
  | "abs"
  | "cardio"
  | "other";

export type MuscleGroupMeta = {
  value: MuscleGroup;
  label: string;
};

export const MUSCLE_GROUPS: MuscleGroupMeta[] = [
  { value: "chest", label: "Peito" },
  { value: "back", label: "Costas" },
  { value: "shoulders", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "legs", label: "Pernas" },
  { value: "glutes", label: "Glúteos" },
  { value: "abs", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
  { value: "other", label: "Outro" },
];

export function muscleLabel(group: MuscleGroup): string {
  return MUSCLE_GROUPS.find((m) => m.value === group)?.label ?? "Outro";
}

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "smith"
  | "machine"
  | "cable"
  | "bodyweight"
  | "time";

export type EquipmentMeta = {
  value: Equipment;
  label: string;
  /** how the load is entered: kg for free weights, plates for machines */
  loadType: LoadType;
};

export const EQUIPMENT: EquipmentMeta[] = [
  { value: "barbell", label: "Barra", loadType: "weight" },
  { value: "dumbbell", label: "Halter", loadType: "weight" },
  { value: "smith", label: "Smith", loadType: "weight" },
  { value: "machine", label: "Máquina", loadType: "plates" },
  { value: "cable", label: "Polia", loadType: "plates" },
  { value: "bodyweight", label: "Corporal", loadType: "bodyweight" },
  { value: "time", label: "Tempo", loadType: "time" },
];

export function equipmentMeta(value: Equipment): EquipmentMeta {
  return EQUIPMENT.find((e) => e.value === value) ?? EQUIPMENT[0];
}

/** Built-in catalog entry; the user cannot create, edit or remove these. */
export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** ways to perform it; the first one is the default */
  equipments: Equipment[];
};

export type WorkoutSet = {
  id: string;
  exerciseId: string;
  /** set belongs to an active/finished session when present */
  sessionId?: string;
  /** absent on sets logged before equipment existed */
  equipment?: Equipment;
  loadType: LoadType;
  /** see `loadTypeMeta(loadType).unit` for the unit */
  load: number;
  /** always 1 for time-based exercises */
  reps: number;
  note?: string;
  createdAt: number;
};

/** A reusable plan: a named group of exercises done on a given day */
export type Workout = {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: number;
};

/** A performed instance of a workout (or a free session) */
export type WorkoutSession = {
  id: string;
  workoutId: string | null;
  name: string;
  startedAt: number;
  /** null while the session is in progress */
  finishedAt: number | null;
  note?: string;
};

/** Body data used by the treadmill calculator; saved so it is typed only once. */
export type Sex = "male" | "female";

export type CardioProfile = {
  weightKg: number;
  age: number;
  /** only used to pick the max-heart-rate formula */
  sex: Sex;
};

/** A treadmill session saved from the calculator, with the estimates frozen. */
export type CardioSession = {
  id: string;
  createdAt: number;
  speedKmh: number;
  inclinePct: number;
  minutes: number;
  weightKg: number;
  kcal: number;
  avgHr: number;
};
