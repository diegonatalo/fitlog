"use client";

import { useState } from "react";
import {
  BarbellIcon,
  CaretRightIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Link, Navigate, useNavigate, useParams } from "@/lib/router";
import { getExercise } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { useStore } from "@/hooks/use-store";
import { MuscleBadge } from "@/components/muscle-badge";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";

export const WorkoutDetail = () => {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const workout = store.workouts.find((w) => w.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!workout) return <Navigate to={paths.workouts} replace />;

  const exercises = workout.exerciseIds
    .map((id) => getExercise(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const activeHere =
    store.activeSession && store.activeSession.workoutId === workout.id;

  const start = () => {
    if (store.activeSession) {
      navigate(paths.session(store.activeSession.id));
      return;
    }
    const session = store.startSession(workout);
    navigate(paths.session(session.id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <Link
          to={paths.editWorkout(workout.id)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-border bg-card text-sm font-bold hover:bg-muted"
        >
          <PencilSimpleIcon size={16} weight="bold" /> Editar
        </Link>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label="Excluir treino"
          className="grid size-11 place-items-center rounded-[14px] border border-border bg-card text-destructive hover:border-destructive/40"
        >
          <TrashIcon size={18} />
        </button>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Exercícios
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {exercises.length}
          </span>
        </div>

        {exercises.length === 0 ? (
          <EmptyState
            icon={BarbellIcon}
            title="Treino sem exercícios"
            description="Edite o treino para adicionar exercícios da biblioteca."
            action={
              <Link
                to={paths.editWorkout(workout.id)}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground"
              >
                <PencilSimpleIcon size={18} weight="bold" /> Editar treino
              </Link>
            }
          />
        ) : (
          <ul className="overflow-hidden rounded-[26px] border border-border bg-card">
            {exercises.map((ex, i) => (
              <li key={ex.id}>
                <Link
                  to={paths.exercise(ex.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">
                      {ex.name}
                    </span>
                  </span>
                  <MuscleBadge group={ex.muscleGroup} />
                  <CaretRightIcon
                    size={16}
                    className="shrink-0 text-muted-foreground"
                    weight="bold"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={start}
        disabled={exercises.length === 0 && !store.activeSession}
        className="sticky bottom-4 flex h-15 w-full items-center justify-center gap-2.5 rounded-[18px] bg-primary text-[17px] font-extrabold text-primary-foreground shadow-[0_12px_40px_rgb(0_0_0/0.4)] transition-opacity font-stretch-semi-expanded disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlayIcon size={20} weight="fill" />
        {activeHere
          ? "Continuar treino"
          : store.activeSession
            ? "Voltar ao treino em andamento"
            : "Iniciar treino"}
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir treino?"
          description={`"${workout.name}" será removido. Os exercícios e o histórico não são afetados.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={() => {
            store.removeWorkout(workout.id);
            navigate(paths.workouts, { replace: true });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};
