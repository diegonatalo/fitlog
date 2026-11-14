import { CalendarBlankIcon, CheckCircleIcon, MoonIcon, PlayIcon } from "@phosphor-icons/react";
import type { MuscleGroup } from "@/types";
import { Link } from "@/lib/router";
import { paths } from "@/lib/paths";
import { MuscleBadge } from "@/components/muscle-badge";

export type TodayPlan =
  | { kind: "workout"; name: string; exercises: number; groups: MuscleGroup[] }
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

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section
    aria-label="Hoje"
    className="rounded-2xl border border-border bg-card p-4"
  >
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Hoje
    </p>
    {children}
  </section>
);

export const TodayCard = ({
  plan,
  doneToday,
  busy,
  onStart,
  onStartFree,
}: TodayCardProps) => {
  if (plan?.kind === "rest") {
    return (
      <Shell>
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
            <MoonIcon size={22} weight="fill" />
          </span>
          <div>
            <p className="font-bold">Dia de descanso</p>
            <p className="text-sm text-muted-foreground">
              {doneToday
                ? "Você treinou mesmo assim."
                : "Recuperar também faz parte do treino."}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (plan?.kind === "workout") {
    return (
      <Shell>
        <p className="truncate text-xl font-bold">{plan.name}</p>
        <p className="mb-2 mt-0.5 text-sm text-muted-foreground">
          {plan.exercises} {plan.exercises === 1 ? "exercício" : "exercícios"}
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {plan.groups.map((g) => (
            <MuscleBadge key={g} group={g} />
          ))}
        </div>
        {doneToday && (
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-accent">
            <CheckCircleIcon size={16} weight="fill" /> Treino de hoje feito
          </p>
        )}
        <button
          onClick={onStart}
          disabled={plan.exercises === 0 || busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlayIcon size={18} weight="fill" />
          {busy
            ? "Outro treino em andamento"
            : doneToday
              ? "Treinar de novo"
              : "Iniciar treino"}
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="font-bold">Nada planejado para hoje</p>
      <p className="mb-3 mt-0.5 text-sm text-muted-foreground">
        {doneToday
          ? "Você já treinou hoje."
          : "Escolha um treino na agenda ou comece um treino livre."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to={paths.schedule}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 font-semibold hover:bg-muted"
        >
          <CalendarBlankIcon size={18} weight="bold" /> Planejar na agenda
        </Link>
        <button
          onClick={onStartFree}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlayIcon size={18} weight="fill" /> Treino livre
        </button>
      </div>
    </Shell>
  );
};
