import { useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { MoonIcon, XIcon } from "@phosphor-icons/react";
import type { Plan, Workout } from "@/types";
import { longDayLabel, weekdayOf, WEEKDAY_NAMES } from "@/lib/dates";
import type { ResolvedPlan } from "@/lib/schedule";
import { cn } from "@/lib/cn";

type DayEditorProps = {
  date: string;
  workouts: Workout[];
  current: ResolvedPlan | null;
  /** a repeat rule covers this date */
  repeating: boolean;
  onApply: (plan: Plan, repeatWeekly: boolean) => void;
  onStopRepeating: () => void;
  onClose: () => void;
};

export const DayEditor = ({
  date,
  workouts,
  current,
  repeating,
  onApply,
  onStopRepeating,
  onClose,
}: DayEditorProps) => {
  const [repeat, setRepeat] = useState(repeating);
  const dialogRef = useRef<HTMLDivElement>(null);
  const weekday = WEEKDAY_NAMES[weekdayOf(date)];

  useFocusTrap(dialogRef, onClose);

  const currentWorkoutId =
    current?.plan.type === "workout" ? current.plan.workoutId : null;
  const isRest = current?.plan.type === "rest";

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Planejar ${longDayLabel(date)}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:border"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold first-letter:uppercase">
              {longDayLabel(date)}
            </h2>
            <p className="text-sm text-muted-foreground">
              O que você vai fazer neste dia?
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3.5">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="size-5 accent-accent"
          />
          <span className="text-sm font-medium">
            Repetir toda {weekday}
            <span className="block text-xs font-normal text-muted-foreground">
              a partir deste dia
            </span>
          </span>
        </label>

        <ul className="flex flex-col gap-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <button
                onClick={() =>
                  onApply({ type: "workout", workoutId: w.id }, repeat)
                }
                aria-pressed={w.id === currentWorkoutId}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left font-semibold transition-colors",
                  w.id === currentWorkoutId
                    ? "border-accent bg-accent/10"
                    : "border-border bg-background hover:bg-muted/50",
                )}
              >
                <span className="truncate">{w.name}</span>
                <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
                  {w.exerciseIds.length} ex.
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => onApply({ type: "rest" }, repeat)}
              aria-pressed={isRest}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border p-3.5 text-left font-semibold transition-colors",
                isRest
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:bg-muted/50",
              )}
            >
              <MoonIcon size={18} weight="fill" />
              Dia de descanso
            </button>
          </li>
        </ul>

        {workouts.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Você ainda não tem treinos. Crie um na aba Treinos.
          </p>
        )}

        {(current || repeating) && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {current && (
              <button
                onClick={() => onApply({ type: "none" }, false)}
                className="rounded-xl border border-border py-3 text-sm font-semibold hover:bg-muted"
              >
                Limpar este dia
              </button>
            )}
            {repeating && (
              <button
                onClick={onStopRepeating}
                className="rounded-xl border border-destructive/40 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Parar de repetir toda {weekday}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
