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
  /** quando presente, o diálogo também oferece remover a série */
  onRemove?: () => void;
};

export const EditSetDialog = ({ set, onClose, onSave, onRemove }: EditSetDialogProps) => {
  const meta = loadTypeMeta(set.loadType);
  const [load, setLoad] = useState(String(set.load));
  const [reps, setReps] = useState(String(set.reps));
  const [note, setNote] = useState(set.note ?? "");

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose);

  const { load: loadNum, reps: repsNum, valid } = parseSetInput(load, reps, meta);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editar série"
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-[32px] border-t border-border bg-card p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-[30px] sm:border"
      >
        <h2 className="mb-4 text-2xl font-extrabold font-stretch-semi-expanded">Editar série</h2>

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
          className="mb-1.5 mt-4 block text-xs font-semibold text-muted-foreground"
        >
          Observação (opcional)
        </label>
        <input
          id="set-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={LIMITS.setNote}
          placeholder="Ex: falha na última, ajuste do banco..."
          className="h-13 w-full rounded-2xl border border-input bg-background px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="h-13 flex-1 rounded-2xl border border-input font-bold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave({ load: loadNum, reps: repsNum, note })}
            disabled={!valid}
            className="h-13 flex-1 rounded-2xl bg-primary font-extrabold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="mt-3 h-12 w-full rounded-2xl text-sm font-bold text-destructive hover:bg-destructive/10"
          >
            Remover série
          </button>
        )}
      </div>
    </div>
  );
};
