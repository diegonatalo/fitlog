"use client";

import { Navigate, useParams } from "@/lib/router";
import type { WorkoutSet } from "@/types";
import { equipmentMeta, loadTypeMeta, muscleLabel } from "@/types";
import { paths } from "@/lib/paths";
import { getExercise, setsForEquipment } from "@/lib/exercises";
import { TrophyIcon } from "@phosphor-icons/react";
import { formatLoad, loadParts, relativeDay } from "@/lib/format";
import { bestSet, dailyBest, estimateOneRepMax, isNewRecord } from "@/lib/stats";
import { dateKey } from "@/lib/dates";
import { useStore } from "@/hooks/use-store";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { EquipmentToggle } from "@/components/equipment-toggle";
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

  const days = dailyBest(equipmentSets, loadType);
  const gain = days.length >= 2 ? days[days.length - 1].load - days[0].load : null;
  const sessionCount = new Set(sets.map((s) => s.sessionId ?? dateKey(new Date(s.createdAt)))).size;
  const bestParts = best ? loadParts(best.loadType, best.load) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="-mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        {muscleLabel(exercise.muscleGroup)}
      </p>

      {exercise.equipments.length > 1 && (
        <EquipmentToggle options={exercise.equipments} value={equipment} onChange={setEquipment} />
      )}

      <section aria-label="Recorde" className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-record">
              <TrophyIcon size={14} weight="fill" aria-hidden="true" /> Recorde
            </p>
            <p className="font-mono text-[44px] leading-none font-bold">
              {bestParts ? bestParts.value : "—"}
              {bestParts && best && (
                <span className="text-lg text-muted-foreground">
                  {" "}
                  {bestParts.unit}
                  {meta.hasReps ? ` × ${best.reps}` : ""}
                </span>
              )}
            </p>
            {oneRepMax !== null && (
              <p className="font-mono text-xs text-muted-foreground">1RM estimado {formatLoad("weight", oneRepMax)}</p>
            )}
          </div>
          {best && <span className="pt-0.5 text-xs text-muted-foreground">{relativeDay(best.createdAt).toLowerCase()}</span>}
        </div>

        <ProgressChart bare sets={equipmentSets} loadType={loadType} />

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3.5">
          <MiniStat
            value={gain === null ? "—" : `${gain > 0 ? "+" : ""}${loadParts(loadType, gain).value}`}
            label={`${loadParts(loadType, 0).unit} de evolução`}
          />
          <MiniStat value={String(sets.length)} label="séries no total" />
          <MiniStat value={String(sessionCount)} label={sessionCount === 1 ? "sessão" : "sessões"} />
        </div>
      </section>

      <LogForm
        hideEquipment
        equipments={exercise.equipments}
        equipment={equipment}
        onEquipmentChange={setEquipment}
        suggestion={last && { load: last.load, reps: last.reps }}
        onSave={handleSave}
      />

      <HistoryList sets={sets} onRemoveSet={store.removeSet} onUpdateSet={store.updateSet} />
    </div>
  );
};

const MiniStat = ({ value, label }: { value: string; label: string }) => (
  <span className="flex min-w-0 flex-col gap-0.5">
    <span className="truncate font-mono text-lg font-bold">{value}</span>{" "}
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </span>
);
