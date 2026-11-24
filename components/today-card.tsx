import { CalendarBlankIcon, CheckCircleIcon, MoonIcon, PlayIcon } from "@phosphor-icons/react";
import type { MuscleGroup } from "@/types";
import { Link } from "@/lib/router";
import { paths } from "@/lib/paths";
import { MuscleBadge } from "@/components/muscle-badge";

export type TodayPlan =
  | {
      kind: "workout";
      name: string;
      exercises: number;
      groups: MuscleGroup[];
      /** os exercícios, na ordem do treino, com a última série de cada um */
      rows?: { name: string; last?: string }[];
      /** duração média das vezes em que o treino foi feito */
      minutes?: number | null;
    }
  | { kind: "rest" }
  | null;

type TodayCardProps = {
  plan: TodayPlan;
  /** a session was already finished today */
  doneToday: boolean;
  /** another session is running, so a new one can't start */
  busy: boolean;
  onStart: () => void;
  onStartFree: () => void;
};

const SHOWN_EXERCISES = 3;
const LIST = new Intl.ListFormat("pt-BR", { type: "conjunction" });

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{children}</p>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section aria-label="Hoje" className="overflow-hidden rounded-3xl border border-border bg-card">
    {children}
  </section>
);

export const TodayCard = ({ plan, doneToday, busy, onStart, onStartFree }: TodayCardProps) => {
  if (plan?.kind === "rest") {
    return (
      <Shell>
        <div className="flex items-center gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted">
            <MoonIcon size={24} weight="fill" />
          </span>
          <div>
            <p className="text-xl font-extrabold font-stretch-semi-expanded">Dia de descanso</p>
            <p className="text-sm text-muted-foreground">
              {doneToday ? "Você treinou mesmo assim." : "Recuperar também faz parte do treino."}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (plan?.kind === "workout") {
    const rows = plan.rows ?? [];
    const shown = rows.slice(0, SHOWN_EXERCISES);
    const others = rows.slice(SHOWN_EXERCISES).map((r) => r.name);
    return (
      <Shell>
        <div className="flex flex-col gap-2.5 px-5 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Kicker>
              <span className="text-accent-text">●</span> Planejado
            </Kicker>
            {plan.minutes != null && (
              <span className="font-mono text-xs text-muted-foreground">~{plan.minutes} min</span>
            )}
          </div>
          <p className="truncate text-[2rem] leading-none font-extrabold font-stretch-semi-expanded">{plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {plan.exercises} {plan.exercises === 1 ? "exercício" : "exercícios"}
          </p>
          {plan.groups.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plan.groups.map((g) => (
                <MuscleBadge key={g} group={g} />
              ))}
            </div>
          )}
        </div>

        {shown.length > 0 && (
          <ol className="mt-4 px-5">
            {shown.map((row, i) => (
              <li key={row.name} className="flex items-center gap-3 border-t border-border py-2.5">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{row.name}</span>
                {row.last && (
                  <span className="shrink-0 font-mono text-[13px] text-muted-foreground">{row.last}</span>
                )}
              </li>
            ))}
            {others.length > 0 && (
              <li className="flex items-center gap-3 border-t border-border py-2.5 text-sm text-muted-foreground">
                <span className="w-5 shrink-0 font-mono text-xs">+{others.length}</span>
                <span className="min-w-0 truncate">{LIST.format(others)}</span>
              </li>
            )}
          </ol>
        )}

        <div className="flex flex-col gap-3 p-5 pt-4">
          {doneToday && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CheckCircleIcon size={18} weight="fill" className="text-accent-text" /> Treino de hoje feito
            </p>
          )}
          <button
            onClick={onStart}
            disabled={plan.exercises === 0 || busy}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-[17px] font-extrabold text-primary-foreground transition-opacity font-stretch-semi-expanded disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon size={20} weight="fill" />
            {busy ? "Outro treino em andamento" : doneToday ? "Treinar de novo" : "Iniciar treino"}
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-5">
        <Kicker>Hoje</Kicker>
        <p className="mt-2 text-xl font-extrabold font-stretch-semi-expanded">Nada planejado para hoje</p>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          {doneToday ? "Você já treinou hoje." : "Escolha um treino na agenda ou comece um treino livre."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={paths.schedule}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-input font-bold hover:bg-muted"
          >
            <CalendarBlankIcon size={18} weight="bold" /> Planejar na agenda
          </Link>
          <button
            onClick={onStartFree}
            disabled={busy}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-extrabold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon size={18} weight="fill" /> Treino livre
          </button>
        </div>
      </div>
    </Shell>
  );
};
