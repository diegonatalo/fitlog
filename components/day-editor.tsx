import { useId, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { XIcon } from "@phosphor-icons/react";
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

type Option = { key: string; plan: Plan; name: string; sub: string };

const planKey = (plan: Plan) => (plan.type === "workout" ? `w:${plan.workoutId}` : plan.type);

/** "toda terça", "todo sábado": sábado e domingo são masculinos. */
const everyDay = (weekday: number) => `${weekday === 0 || weekday === 6 ? "todo" : "toda"} ${WEEKDAY_NAMES[weekday].replace("-feira", "")}`;

/** Painel do dia: escolhe o plano, decide se repete toda semana e salva. */
export const DayEditor = ({
  date,
  workouts,
  current,
  repeating,
  onApply,
  onStopRepeating,
  onClose,
}: DayEditorProps) => {
  const options: Option[] = [
    ...workouts.map((w) => ({
      key: `w:${w.id}`,
      plan: { type: "workout", workoutId: w.id } as Plan,
      name: w.name,
      sub: `${w.exerciseIds.length} ${w.exerciseIds.length === 1 ? "exercício" : "exercícios"}`,
    })),
    { key: "rest", plan: { type: "rest" }, name: "Descanso", sub: "Dia de recuperação" },
    { key: "none", plan: { type: "none" }, name: "Nada planejado", sub: "Deixar o dia livre" },
  ];
  const [selected, setSelected] = useState(current ? planKey(current.plan) : "none");
  const [repeat, setRepeat] = useState(repeating);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const weekday = weekdayOf(date);

  useFocusTrap(dialogRef, onClose);

  const save = () => {
    const plan = options.find((o) => o.key === selected)?.plan ?? { type: "none" };
    // desligar o "repetir" encerra a regra semanal a partir deste dia
    if (repeating && !repeat) onStopRepeating();
    onApply(plan, repeat && plan.type !== "none");
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col gap-3.5 overflow-y-auto rounded-t-[32px] border-t border-border bg-card px-5 pt-3 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-[30px] sm:border sm:pt-5"
      >
        <span aria-hidden="true" className="h-1.5 w-10 self-center rounded-full bg-input sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {longDayLabel(date)}
            </p>
            <h2 id={titleId} className="text-2xl leading-tight font-extrabold font-stretch-semi-expanded">
              O que fazer neste dia?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-muted text-muted-foreground hover:text-foreground"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        <div role="radiogroup" aria-label="Plano do dia" className="flex flex-col gap-2">
          {options.map((o) => {
            const on = o.key === selected;
            return (
              <button
                key={o.key}
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(o.key)}
                className={cn(
                  "flex min-h-15 items-center gap-3.5 rounded-[18px] border px-4 py-2.5 text-left transition-colors",
                  on ? "border-[1.5px] border-accent bg-accent/10" : "border-border hover:bg-muted/50",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 rounded-full",
                    on ? "border-[6px] border-accent" : "border-2 border-input",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{o.name}</span>
                  <span className="block text-xs text-muted-foreground">{o.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        {workouts.length === 0 && (
          <p className="text-sm text-muted-foreground">Você ainda não tem treinos. Crie um na aba Treinos.</p>
        )}

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[18px] border border-border bg-background px-4 py-3.5">
          <span>
            <span className="block font-bold first-letter:uppercase">Repetir {everyDay(weekday)}</span>
            <span className="block text-xs text-muted-foreground">Vale para as próximas semanas</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-7.5 w-13 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card after:absolute after:top-[3px] after:left-[3px] after:size-6 after:rounded-full after:bg-foreground after:transition-transform peer-checked:after:translate-x-[22px] peer-checked:after:bg-accent-foreground"
          />
        </label>

        <button
          onClick={save}
          className="h-14 rounded-[18px] bg-primary text-base font-extrabold text-primary-foreground font-stretch-semi-expanded"
        >
          Salvar dia
        </button>
      </div>
    </div>
  );
};
