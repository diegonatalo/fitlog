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
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Planejar ${longDayLabel(date)}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-[32px] border-t border-border bg-card p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-[30px] sm:border"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl leading-tight font-extrabold first-letter:uppercase font-stretch-semi-expanded">
              {longDayLabel(date)}
            </h2>
            <p className="text-sm text-muted-foreground">
              O que você vai fazer neste dia?
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-muted text-muted-foreground hover:text-foreground"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-background p-4">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="size-5 accent-[var(--accent)]"
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
                  "flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] border px-4 text-left font-bold transition-colors",
                  w.id === currentWorkoutId
                    ? "border-[1.5px] border-accent bg-accent/10"
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
                "flex min-h-14 w-full items-center gap-2 rounded-[18px] border px-4 text-left font-bold transition-colors",
                isRest
                  ? "border-[1.5px] border-accent bg-accent/10"
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
                className="h-12 rounded-2xl border border-input text-sm font-bold hover:bg-muted"
              >
                Limpar este dia
              </button>
            )}
            {repeating && (
              <button
                onClick={onStopRepeating}
                className="h-12 rounded-2xl border border-destructive/40 text-sm font-bold text-destructive hover:bg-destructive/10"
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
