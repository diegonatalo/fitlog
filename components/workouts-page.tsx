"use client";

import {
  BarbellIcon,
  CaretRightIcon,
  ListChecksIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link } from "@/lib/router";
import type { MuscleGroup } from "@/types";
import { muscleLabel } from "@/types";
import { getExercise } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { formatSet } from "@/lib/format";
import { useStore } from "@/hooks/use-store";
import { EmptyState } from "@/components/empty-state";
import { useToday } from "@/hooks/use-today";
import { averageMinutes, dayName, nextPlannedDay, workoutInitial } from "@/lib/workout-stats";

const groupsOf = (exerciseIds: string[]): MuscleGroup[] => {
  const groups: MuscleGroup[] = [];
  for (const id of exerciseIds) {
    const g = getExercise(id)?.muscleGroup;
    if (g && !groups.includes(g)) groups.push(g);
  }
  return groups.slice(0, 4);
};

/** exercícios mostrados no cartão nas telas largas */
const PREVIEW_EXERCISES = 3;

const LIST = new Intl.ListFormat("pt-BR", { type: "conjunction" });

const Fact = ({ value, label, text = false }: { value: string; label: string; text?: boolean }) => (
  <span className="flex min-w-0 flex-col gap-0.5">
    <span className={cn("truncate font-bold", text ? "pt-0.5 text-[15px]" : "font-mono text-lg")}>{value}</span>{" "}
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </span>
);

export const WorkoutsPage = () => {
  const { workouts, sessions, schedule, setsByExercise } = useStore();
  const today = useToday();

  return (
    <div className="flex flex-col gap-4">
      {workouts.length === 0 ? (
        <EmptyState
          icon={ListChecksIcon}
          title="Monte seu primeiro treino"
          description="Agrupe os exercícios de um dia (ex: Peito e Tríceps) em um treino e depois coloque-o na agenda."
          action={
            <Link
              to={paths.newWorkout}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground"
            >
              <PlusIcon size={20} weight="bold" /> Criar treino
            </Link>
          }
        />
      ) : (
        // telas largas: cartões em grade, com os primeiros exercícios e a última carga
        <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] lg:gap-4">
          {workouts.map((w) => {
            const groups = groupsOf(w.exerciseIds);
            const n = w.exerciseIds.length;
            const minutes = averageMinutes(sessions, w.id);
            const next = today ? nextPlannedDay(schedule, w.id, today) : null;
            const isToday = !!next && next === today;
            const preview = w.exerciseIds.slice(0, PREVIEW_EXERCISES).flatMap((id) => {
              const exercise = getExercise(id);
              if (!exercise) return [];
              const last = setsByExercise.get(id)?.[0];
              return [{ id, name: exercise.name, last: last ? formatSet(last) : null }];
            });
            return (
              <li key={w.id} className="lg:flex">
                <Link
                  to={paths.workout(w.id)}
                  className="flex w-full flex-col gap-3.5 rounded-[26px] border border-border bg-card p-[18px] transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold font-stretch-expanded",
                        isToday ? "bg-accent text-accent-foreground" : "bg-muted",
                      )}
                    >
                      {workoutInitial(w.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xl leading-tight font-extrabold font-stretch-semi-expanded">
                        {w.name}
                      </span>
                      <span className="mt-1 block truncate text-sm text-muted-foreground">
                        {groups.length === 0 ? "Sem exercícios ainda" : LIST.format(groups.map(muscleLabel))}
                      </span>
                    </span>
                    <CaretRightIcon size={18} className="mt-1.5 shrink-0 text-muted-foreground" weight="bold" />
                  </span>
                  {preview.length > 0 && (
                    <span className="hidden flex-1 flex-col lg:flex">
                      {preview.map((ex) => (
                        <span key={ex.id} className="flex items-center gap-3 border-t border-border py-2.5 text-sm">
                          <span className="min-w-0 flex-1 truncate font-semibold">{ex.name}</span>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">{ex.last ?? "—"}</span>
                        </span>
                      ))}
                      {n > preview.length && (
                        <span className="border-t border-border py-2.5 text-sm text-muted-foreground">
                          + {n - preview.length} {n - preview.length === 1 ? "exercício" : "exercícios"}
                        </span>
                      )}
                    </span>
                  )}
                  <span className="grid grid-cols-3 gap-2 border-t border-border pt-3.5">
                    <Fact value={String(n)} label={n === 1 ? "exercício" : "exercícios"} />
                    <Fact value={minutes === null ? "—" : String(minutes)} label="min em média" />
                    <Fact value={next && today ? dayName(next, today) : "—"} label="na agenda" text />
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="lg:flex">
            <Link
              to={paths.newWorkout}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border-[1.5px] border-dashed lg:h-auto lg:min-h-48 lg:rounded-[26px] border-input font-bold text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              <PlusIcon size={20} weight="bold" />
              Criar treino
            </Link>
          </li>
        </ul>
      )}

      <Link
        to={paths.library}
        className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-4 transition-colors hover:bg-muted/50"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-muted text-accent-text">
          <BarbellIcon size={20} weight="fill" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Ver exercícios</span>
          <span className="block text-xs text-muted-foreground">
            Busque e acompanhe a evolução de cada exercício
          </span>
        </span>
        <CaretRightIcon
          size={18}
          className="shrink-0 text-muted-foreground"
          weight="bold"
        />
      </Link>
    </div>
  );
};
