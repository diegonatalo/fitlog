"use client";

import { useMemo } from "react";
import { CaretRightIcon, PlayIcon, TrophyIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "@/lib/router";
import type { MuscleGroup } from "@/types";
import { muscleLabel } from "@/types";
import { dashboardStats } from "@/lib/dashboard";
import { dateKey } from "@/lib/dates";
import { getExercise } from "@/lib/exercises";
import { formatSet, formatTime, relativeDay } from "@/lib/format";
import { averageMinutes } from "@/lib/workout-stats";
import { paths } from "@/lib/paths";
import { resolvePlan } from "@/lib/schedule";
import { useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";
import { TodayCard, type TodayPlan } from "@/components/today-card";
import { WeekStrip } from "@/components/week-strip";
import { weekStrip } from "@/lib/week";
import { cn } from "@/lib/cn";

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
      rows: todayWorkout.exerciseIds.flatMap((id) => {
        const exercise = getExercise(id);
        if (!exercise) return [];
        const last = store.setsByExercise.get(id)?.[0];
        return [{ name: exercise.name, last: last ? formatSet(last) : undefined }];
      }),
      minutes: averageMinutes(store.sessions, todayWorkout.id),
    };
  }, [today, store.schedule, store.setsByExercise, store.sessions, todayWorkout]);

  const doneDays = useMemo(
    () => new Set(store.finishedSessions.map((s) => dateKey(new Date(s.startedAt)))),
    [store.finishedSessions],
  );
  const doneToday = !!today && doneDays.has(today);

  const week = useMemo(
    () => (today ? weekStrip(today, store.schedule, doneDays) : null),
    [today, store.schedule, doneDays],
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
  const weekDone = week?.filter((d) => d.status === "done").length ?? 0;
  // dias com treino na agenda, feitos ou não
  const weekPlanned =
    week && today ? week.filter((d) => resolvePlan(store.schedule, d.key)?.plan.type === "workout").length : 0;
  const volumeDelta =
    stats && stats.volumePrev7 > 0
      ? Math.round(((stats.volume7 - stats.volumePrev7) / stats.volumePrev7) * 100)
      : null;
  const lastRecordName = stats?.lastRecordExerciseId ? getExercise(stats.lastRecordExerciseId)?.name : undefined;
  const hasData = store.finishedSessions.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {activeSession && (
        <Link
          to={paths.session(activeSession.id)}
          className="flex items-center gap-3 rounded-3xl bg-accent p-4 text-left text-accent-foreground"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-foreground text-accent">
            <PlayIcon size={22} weight="fill" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
              Treino em andamento
            </span>
            <span className="block truncate text-lg font-extrabold font-stretch-semi-expanded">
              {activeSession.name}
            </span>
            <span className="block text-xs font-medium">
              Iniciado {relativeDay(activeSession.startedAt).toLowerCase()} às{" "}
              {formatTime(activeSession.startedAt)}
            </span>
          </span>
          <CaretRightIcon size={20} className="shrink-0" weight="bold" />
        </Link>
      )}

      {week && <WeekStrip days={week} />}

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
        <section aria-labelledby="progresso" className="mt-3 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="progresso" className="text-xl font-extrabold font-stretch-semi-expanded">
              Seu ritmo
            </h2>
            {hasData && (
              <Link
                to={paths.progress}
                className="text-sm font-bold underline decoration-accent decoration-2 underline-offset-4"
              >
                Ver tudo
              </Link>
            )}
          </div>

          {!hasData && (
            <p className="rounded-2xl border border-dashed border-input p-4 text-center text-sm text-muted-foreground">
              Termine seu primeiro treino e as estatísticas aparecem aqui.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="Treinos · semana">
              <p className="font-mono text-[40px] leading-none font-bold">
                {weekDone}
                {weekPlanned > 0 && <span className="text-base text-muted-foreground">/{weekPlanned}</span>}
              </p>
              {week && (
                <div aria-hidden="true" className="grid h-5.5 grid-cols-7 items-end gap-1">
                  {week.map((d) => (
                    <span
                      key={d.key}
                      className={cn("rounded-[4px]", d.status === "done" ? "h-5.5 bg-accent" : "h-1.5 bg-border")}
                    />
                  ))}
                </div>
              )}
            </Stat>
            <Stat label="Volume · 7 dias">
              <p className="font-mono text-3xl leading-tight font-bold">
                {formatVolume(stats.volume7)}
              </p>
              {volumeDelta !== null && (
                <p className="text-[13px] font-semibold text-accent-text">
                  {volumeDelta >= 0 ? "▲" : "▼"} {Math.abs(volumeDelta)}% vs semana passada
                </p>
              )}
            </Stat>
            <Stat label="Recordes · 30 dias">
              <p className="flex items-center gap-2 font-mono text-3xl leading-none font-bold">
                <TrophyIcon size={22} weight="fill" className="text-record" aria-hidden="true" />
                {stats.records30}
              </p>
              {lastRecordName && <p className="truncate text-[13px] text-muted-foreground">Último: {lastRecordName}</p>}
            </Stat>
            <Stat label="Duração média">
              <p className="font-mono text-3xl leading-tight font-bold">
                {stats.avgMinutes === null ? "—" : stats.avgMinutes}
                {stats.avgMinutes !== null && <span className="text-base text-muted-foreground"> min</span>}
              </p>
              <p className="text-[13px] text-muted-foreground">últimos 30 dias</p>
            </Stat>
          </div>

          {stats.muscles30.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="mb-4 text-xs font-semibold text-muted-foreground">
                Músculos mais treinados · 30 dias
              </h3>
              <ul className="flex flex-col gap-3.5">
                {stats.muscles30.slice(0, 5).map(({ group, sets }) => (
                  <li key={group} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3">
                    <span className="truncate text-sm font-semibold">{muscleLabel(group)}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-muted" role="presentation">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${(sets / maxSets) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-mono text-xs text-muted-foreground">
                      {sets} sér.
                    </span>
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

const Stat = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-2.5 rounded-[22px] border border-border bg-card p-4">
    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    {children}
  </div>
);

/** Volume em kg, ou em toneladas a partir de 1.000 kg: "850 kg", "12,4 t". */
const formatVolume = (kg: number) =>
  kg >= 1000 ? (
    <>
      {(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
      <span className="text-base text-muted-foreground"> t</span>
    </>
  ) : (
    <>
      {kg.toLocaleString("pt-BR")}
      <span className="text-base text-muted-foreground"> kg</span>
    </>
  );
