"use client";

import {
  BarbellIcon,
  CaretRightIcon,
  ListChecksIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link } from "@/lib/router";
import type { MuscleGroup } from "@/types";
import { getExercise } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { useStore } from "@/hooks/use-store";
import { EmptyState } from "@/components/empty-state";
import { MuscleBadge } from "@/components/muscle-badge";

const groupsOf = (exerciseIds: string[]): MuscleGroup[] => {
  const groups: MuscleGroup[] = [];
  for (const id of exerciseIds) {
    const g = getExercise(id)?.muscleGroup;
    if (g && !groups.includes(g)) groups.push(g);
  }
  return groups.slice(0, 4);
};

export const WorkoutsPage = () => {
  const { workouts } = useStore();

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
        <ul className="flex flex-col gap-3">
          {workouts.map((w, i) => {
            const groups = groupsOf(w.exerciseIds);
            const n = w.exerciseIds.length;
            return (
              <li key={w.id}>
                <Link
                  to={paths.workout(w.id)}
                  className="flex w-full items-start gap-4 rounded-[26px] border border-border bg-card p-[18px] transition-colors hover:bg-muted/50"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-2xl font-mono text-lg font-bold",
                      i === 0 ? "bg-accent text-accent-foreground" : "bg-muted",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 block truncate text-xl leading-tight font-extrabold font-stretch-semi-expanded">
                      {w.name}
                    </span>
                    <span className="mb-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ListChecksIcon size={14} weight="bold" />
                      {n} {n === 1 ? "exercício" : "exercícios"}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {groups.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Sem exercícios ainda
                        </span>
                      ) : (
                        groups.map((g) => <MuscleBadge key={g} group={g} />)
                      )}
                    </span>
                  </span>
                  <CaretRightIcon
                    size={18}
                    className="mt-1 shrink-0 text-muted-foreground"
                    weight="bold"
                  />
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to={paths.newWorkout}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border-[1.5px] border-dashed border-input font-bold text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
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
