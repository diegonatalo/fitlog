import { useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import type { Equipment, Exercise, WorkoutSet } from "@/types";
import { muscleLabel } from "@/types";
import { setsForEquipment } from "@/lib/exercises";
import { useEquipmentChoice } from "@/hooks/use-equipment-choice";
import { formatSet, loadParts } from "@/lib/format";
import { recordIds } from "@/lib/stats";
import { cn } from "@/lib/cn";
import { EditSetDialog } from "./edit-set-dialog";
import { EquipmentToggle } from "./equipment-toggle";
import { LogForm } from "./log-form";

type SessionExerciseCardProps = {
  exercise: Exercise;
  /** posição do exercício no treino, a partir de 1 */
  position: number;
  total: number;
  /** sets logged in the current session, oldest first */
  sets: WorkoutSet[];
  /** every set of this exercise, from any session, newest first */
  history: WorkoutSet[];
  /** as séries da sessão anterior deste exercício, em ordem */
  previous: WorkoutSet[];
  onAddSet: (equipment: Equipment, load: number, reps: number) => boolean;
  onUpdateSet: (id: string, patch: { load: number; reps: number; note: string }) => void;
  onRemoveSet: (id: string) => void;
};

const COLUMNS = "grid grid-cols-[2rem_minmax(0,1fr)_4rem_3.25rem_2.25rem] items-center gap-2";

/** O exercício da vez: as séries numa tabela com a sessão anterior ao lado, e o registro da próxima. */
export const SessionExerciseCard = ({
  exercise,
  position,
  total,
  sets,
  history,
  previous,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: SessionExerciseCardProps) => {
  const [editing, setEditing] = useState<WorkoutSet | null>(null);
  const records = recordIds(history);
  // the latest set of this session, or else the last one ever logged
  const last = sets[sets.length - 1] ?? history[0];
  const [equipment, setEquipment] = useEquipmentChoice(exercise, last);
  const lastForEquipment =
    setsForEquipment([...sets].reverse(), exercise, equipment)[0] ??
    setsForEquipment(history, exercise, equipment)[0];
  const rows = Math.max(sets.length + 1, previous.length);

  return (
    <section aria-label={exercise.name} className="overflow-hidden rounded-[28px] border border-border bg-card">
      <div className="flex flex-col gap-1.5 px-[18px] pt-[18px] pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          Exercício {position} de {total} · {muscleLabel(exercise.muscleGroup)}
        </p>
        <h2 className="text-[26px] leading-tight font-extrabold font-stretch-semi-expanded">{exercise.name}</h2>
      </div>

      {exercise.equipments.length > 1 && (
        <div className="px-[18px]">
          <EquipmentToggle options={exercise.equipments} value={equipment} onChange={setEquipment} />
        </div>
      )}

      <div className="px-[18px] pt-3.5">
        <div
          aria-hidden="true"
          className={cn(COLUMNS, "pb-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground")}
        >
          <span>SÉR.</span>
          <span>ANTERIOR</span>
          <span className="text-right">KG</span>
          <span className="text-right">REPS</span>
          <span />
        </div>
        <ol>
          {Array.from({ length: rows }, (_, i) => {
            const set = sets[i];
            const before = previous[i];
            const record = set && records.has(set.id);
            const label = (
              <>
                <span
                  className={cn(
                    "font-mono text-sm font-bold",
                    set ? "text-muted-foreground" : i === sets.length ? "text-accent-text" : "text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 items-center gap-1.5 font-mono text-[13px] text-muted-foreground">
                  <span className="truncate">{before ? formatSet(before) : "—"}</span>
                  {record && (
                    <span className="shrink-0 rounded-md bg-record/15 px-1.5 py-0.5 font-sans text-[10px] font-extrabold text-record">
                      RECORDE
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-right font-mono text-base font-bold",
                    !set && "text-muted-foreground",
                    record && "text-record",
                  )}
                >
                  {set ? loadParts(set.loadType, set.load).value : "—"}
                </span>
                <span className={cn("text-right font-mono text-base font-bold", !set && "text-muted-foreground")}>
                  {set ? set.reps : "—"}
                </span>
                {set ? (
                  <span className="grid size-7 place-items-center justify-self-end rounded-[9px] bg-accent/15 text-accent-text">
                    <CheckIcon size={16} weight="bold" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="size-7 justify-self-end rounded-[9px] border-[1.5px] border-dashed border-input" />
                )}
              </>
            );
            return (
              <li key={set?.id ?? `vazia-${i}`} className="border-t border-border">
                {set ? (
                  <button
                    onClick={() => setEditing(set)}
                    aria-label={`Editar série ${i + 1}: ${formatSet(set)}`}
                    className={cn(COLUMNS, "min-h-12 w-full text-left hover:bg-muted/40")}
                  >
                    {label}
                  </button>
                ) : (
                  <div className={cn(COLUMNS, "min-h-12")}>{label}</div>
                )}
                {set?.note && <p className="-mt-1 pb-2 pl-10 text-xs italic text-muted-foreground">{set.note}</p>}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-1.5 border-t border-border bg-background/50 p-[18px]">
        <LogForm
          bare
          hideEquipment
          equipments={exercise.equipments}
          equipment={equipment}
          onEquipmentChange={setEquipment}
          suggestion={lastForEquipment && { load: lastForEquipment.load, reps: lastForEquipment.reps }}
          onSave={(load, reps) => onAddSet(equipment, load, reps)}
        />
      </div>

      {editing && (
        <EditSetDialog
          set={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdateSet(editing.id, patch);
            setEditing(null);
          }}
          onRemove={() => {
            onRemoveSet(editing.id);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
};
