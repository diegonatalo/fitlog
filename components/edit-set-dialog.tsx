import { useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { WorkoutSet } from "@/types";
import { loadTypeMeta } from "@/types";
import { cn } from "@/lib/cn";
import { parseSetInput } from "@/lib/set-input";
import { LIMITS } from "@/lib/schema";
import { Stepper } from "./stepper";

type EditSetDialogProps = {
  set: WorkoutSet;
  onClose: () => void;
  onSave: (patch: { load: number; reps: number; note: string }) => void;
};

export const EditSetDialog = ({ set, onClose, onSave }: EditSetDialogProps) => {
  const meta = loadTypeMeta(set.loadType);
  const [load, setLoad] = useState(String(set.load));
  const [reps, setReps] = useState(String(set.reps));
  const [note, setNote] = useState(set.note ?? "");

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose);

  const { load: loadNum, reps: repsNum, valid } = parseSetInput(load, reps, meta);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editar série"
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:border"
      >
        <h2 className="mb-4 text-lg font-bold">Editar série</h2>

        <div
          className={cn(
            "grid gap-3",
            meta.hasReps ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          <Stepper
            label={meta.loadLabel}
            value={load}
            onChange={setLoad}
            step={meta.step}
          />
          {meta.hasReps && (
            <Stepper
              label="Repetições"
              value={reps}
              onChange={(v) => setReps(v.replace(/[^\d]/g, ""))}
              step={1}
            />
          )}
        </div>

        <label
          htmlFor="set-note"
          className="mb-1.5 mt-4 block text-xs font-medium text-muted-foreground"
        >
          Observação (opcional)
        </label>
        <input
          id="set-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={LIMITS.setNote}
          placeholder="Ex: falha na última, ajuste do banco..."
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-background py-3 font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave({ load: loadNum, reps: repsNum, note })}
            disabled={!valid}
            className="flex-1 rounded-xl bg-accent py-3 font-bold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
