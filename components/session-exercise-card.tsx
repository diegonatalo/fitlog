import { useState } from "react";
import {
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import type { Equipment, Exercise, WorkoutSet } from "@/types";
import { setsForEquipment } from "@/lib/exercises";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { formatLoad, formatSet } from "@/lib/format";
import { recordIds } from "@/lib/stats";
import { EditSetDialog } from "./edit-set-dialog";
import { LogForm } from "./log-form";
import { MuscleBadge } from "./muscle-badge";
import { cn } from "@/lib/cn";

type SessionExerciseCardProps = {
  exercise: Exercise;
  /** sets logged in the current session, oldest first */
  sets: WorkoutSet[];
  /** previous set of this exercise, from any session, newest first */
  history: WorkoutSet[];
  onAddSet: (
    equipment: Equipment,
    load: number,
    reps: number,
  ) => boolean;
  onUpdateSet: (
    id: string,
    patch: { load: number; reps: number; note: string },
  ) => void;
  onRemoveSet: (id: string) => void;
};

export const SessionExerciseCard = ({
  exercise,
  sets,
  history,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: SessionExerciseCardProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutSet | null>(null);
  const records = recordIds(history);
  // the latest set of this session, or else the last one ever logged
  const last = sets[sets.length - 1] ?? history[0];
  const [equipment, setEquipment] = useEquipmentChoice(exercise, last);
  const lastForEquipment =
    setsForEquipment([...sets].reverse(), exercise, equipment)[0] ??
    setsForEquipment(history, exercise, equipment)[0];

  return (
    <li className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xl leading-tight font-extrabold font-stretch-semi-expanded">
            {exercise.name}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {sets.length} {sets.length === 1 ? "série" : "séries"}
            {last && sets.length === 0 && (
              <> · última vez {formatLoad(last.loadType, last.load)}</>
            )}
          </span>
        </span>
        <MuscleBadge group={exercise.muscleGroup} />
      </div>

      {sets.length > 0 && (
        <ol className="px-4 pb-2">
          {sets.map((s, i) => (
            <li
              key={s.id}
              className="flex min-h-12 items-center gap-3 border-t border-border py-1.5"
            >
              <span className="w-6 font-mono text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "flex items-center gap-2 font-mono text-base font-bold",
                    records.has(s.id) && "text-record",
                  )}
                >
                  {formatSet(s)}
                  {records.has(s.id) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-record/15 px-1.5 py-0.5 font-sans text-[10px] font-extrabold tracking-wide">
                      <TrophyIcon size={12} weight="fill" aria-hidden="true" />
                      RECORDE
                    </span>
                  )}
                </span>
                {s.note && (
                  <span className="block truncate text-xs italic text-muted-foreground">
                    {s.note}
                  </span>
                )}
              </span>
              <button
                onClick={() => setEditing(s)}
                aria-label="Editar série"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PencilSimpleIcon size={16} />
              </button>
              <button
                onClick={() => onRemoveSet(s.id)}
                aria-label="Remover série"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <TrashIcon size={16} />
              </button>
            </li>
          ))}
        </ol>
      )}

      {open ? (
        <div className="border-t border-border bg-background/40 p-4">
          <LogForm
            bare
            equipments={exercise.equipments}
            equipment={equipment}
            onEquipmentChange={setEquipment}
            suggestion={
              lastForEquipment && {
                load: lastForEquipment.load,
                reps: lastForEquipment.reps,
              }
            }
            onSave={(load, reps) => onAddSet(equipment, load, reps)}
          />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-13 w-full items-center justify-center gap-2 border-t border-border text-sm font-bold text-foreground hover:bg-muted"
        >
          <PlusIcon size={18} weight="bold" className="text-accent-text" /> Registrar série
        </button>
      )}

      {editing && (
        <EditSetDialog
          set={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdateSet(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </li>
  );
};
