"use client";

import { Navigate, useParams } from "@/lib/router";
import type { WorkoutSet } from "@/types";
import { equipmentMeta, loadTypeMeta } from "@/types";
import { paths } from "@/lib/paths";
import { getExercise, setsForEquipment } from "@/lib/exercises";
import { formatLoad } from "@/lib/format";
import { bestSet, estimateOneRepMax, isNewRecord } from "@/lib/stats";
import { useStore } from "@/hooks/use-store";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { MuscleBadge } from "@/components/muscle-badge";
import { LogForm } from "@/components/log-form";
import { HistoryList } from "@/components/history-list";
import { ProgressChart } from "@/components/progress-chart";

const NO_SETS: WorkoutSet[] = [];

export const ExerciseDetail = () => {
  const { id = "" } = useParams();
  const exercise = getExercise(id);
  if (!exercise) return <Navigate to={paths.library} replace />;
  return <ExerciseDetailBody key={exercise.id} exerciseId={exercise.id} />;
};

const ExerciseDetailBody = ({ exerciseId }: { exerciseId: string }) => {
  const store = useStore();
  const exercise = getExercise(exerciseId)!;
  const sets = store.setsByExercise.get(exerciseId) ?? NO_SETS;
  const [equipment, setEquipment] = useEquipmentChoice(exercise, sets[0]);

  const loadType = equipmentMeta(equipment).loadType;
  const equipmentSets = setsForEquipment(sets, exercise, equipment);
  const best = bestSet(equipmentSets, loadType);
  const meta = loadTypeMeta(loadType);
  const oneRepMax =
    best && loadType === "weight"
      ? estimateOneRepMax(best.load, best.reps)
      : null;
  const last = equipmentSets[0];

  const handleSave = (load: number, reps: number) => {
    const record = isNewRecord(equipmentSets, loadType, load);
    store.addSet(exercise.id, equipment, loadType, load, reps);
    return record;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <MuscleBadge group={exercise.muscleGroup} size="md" />
      </div>

      <section className="grid grid-cols-2 gap-2">
        <StatCard label="Registros" value={String(sets.length)} />
        <StatCard
          label="Recorde"
          value={best ? formatLoad(best.loadType, best.load) : "—"}
          sub={best && meta.hasReps ? `${best.reps} reps` : undefined}
        />
        {oneRepMax !== null && (
          <StatCard
            label="1RM estimado"
            value={formatLoad("weight", oneRepMax)}
            className="col-span-2"
          />
        )}
      </section>

      <LogForm
        equipments={exercise.equipments}
        equipment={equipment}
        onEquipmentChange={setEquipment}
        suggestion={last && { load: last.load, reps: last.reps }}
        onSave={handleSave}
      />

      <ProgressChart sets={equipmentSets} loadType={loadType} />

      <HistoryList
        sets={sets}
        onRemoveSet={store.removeSet}
        onUpdateSet={store.updateSet}
      />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card p-4 ${className}`}
    >
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold leading-none">{value}</p>
      {sub && (
        <p className="mt-1 font-mono text-sm font-medium text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
};
