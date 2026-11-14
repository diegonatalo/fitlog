"use client";

import { useMemo } from "react";
import { CaretRightIcon, PlayIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "@/lib/router";
import type { MuscleGroup } from "@/types";
import { muscleLabel } from "@/types";
import { dashboardStats } from "@/lib/dashboard";
import { dateKey } from "@/lib/dates";
import { getExercise } from "@/lib/exercises";
import { formatTime, relativeDay } from "@/lib/format";
import { paths } from "@/lib/paths";
import { resolvePlan } from "@/lib/schedule";
import { useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";
import { TodayCard, type TodayPlan } from "@/components/today-card";

export const HomePage = () => {
  const store = useStore();
  const navigate = useNavigate();
  const today = useToday();
  const { workouts, activeSession } = store;

  const todayWorkout = useMemo(() => {
    if (!today) return null;
    const plan = resolvePlan(store.schedule, today)?.plan;
    if (plan?.type !== "workout") return null;
    return workouts.find((w) => w.id === plan.workoutId) ?? null;
  }, [today, store.schedule, workouts]);

  const todayPlan: TodayPlan = useMemo(() => {
    if (!today) return null;
    const plan = resolvePlan(store.schedule, today)?.plan;
    if (plan?.type === "rest") return { kind: "rest" };
    if (!todayWorkout) return null;
    const groups: MuscleGroup[] = [];
    for (const id of todayWorkout.exerciseIds) {
      const g = getExercise(id)?.muscleGroup;
      if (g && !groups.includes(g)) groups.push(g);
    }
    return {
      kind: "workout",
      name: todayWorkout.name,
      exercises: todayWorkout.exerciseIds.length,
      groups: groups.slice(0, 4),
    };
  }, [today, store.schedule, todayWorkout]);

  const doneToday = useMemo(
    () =>
      store.finishedSessions.some((s) => dateKey(new Date(s.startedAt)) === today),
    [store.finishedSessions, today],
  );

  const stats = useMemo(
    () =>
      today
        ? dashboardStats(
            store.sessions,
            store.sets,
            today,
            (id) => getExercise(id)?.muscleGroup,
          )
        : null,
    [today, store.sessions, store.sets],
  );

  const start = (workout: typeof todayWorkout) => {
    const session = store.startSession(workout);
    navigate(paths.session(session.id));
  };

  const maxSets = stats?.muscles30[0]?.sets ?? 1;
  const hasData = store.finishedSessions.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {activeSession && (
        <Link
          to={paths.session(activeSession.id)}
          className="flex items-center gap-3 rounded-2xl border border-accent/50 bg-accent/10 p-4 text-left"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <PlayIcon size={22} weight="fill" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-accent">
              Treino em andamento
            </span>
            <span className="block truncate font-bold">
              {activeSession.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              Iniciado {relativeDay(activeSession.startedAt).toLowerCase()} às{" "}
              {formatTime(activeSession.startedAt)}
            </span>
          </span>
          <CaretRightIcon
            size={20}
            className="shrink-0 text-accent"
            weight="bold"
          />
        </Link>
      )}

      {today && (
        <TodayCard
          plan={todayPlan}
          doneToday={doneToday}
          busy={!!activeSession}
          onStart={() => start(todayWorkout)}
          onStartFree={() => start(null)}
        />
      )}

      {stats && (
        <section aria-label="Estatísticas" className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Seu progresso
          </h2>

          {!hasData && (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Termine seu primeiro treino e as estatísticas aparecem aqui.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Treinos (7 dias)" value={String(stats.sessions7)} />
            <Stat label="Treinos (30 dias)" value={String(stats.sessions30)} />
            <Stat
              label="Volume (7 dias)"
              value={`${stats.volume7.toLocaleString("pt-BR")} kg`}
            />
            <Stat label="Recordes (30 dias)" value={String(stats.records30)} />
            <Stat
              label="Duração média"
              value={stats.avgMinutes === null ? "—" : `${stats.avgMinutes} min`}
              className="col-span-2"
            />
          </div>

          {stats.muscles30.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Músculos mais treinados (30 dias)
              </h3>
              <ul className="flex flex-col gap-2.5">
                {stats.muscles30.slice(0, 5).map(({ group, sets }) => (
                  <li key={group}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{muscleLabel(group)}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {sets} {sets === 1 ? "série" : "séries"}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(sets / maxSets) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const Stat = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card p-4 ${className}`}
    >
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold leading-none">{value}</p>
    </div>
  );
};
