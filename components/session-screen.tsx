"use client";

import { useState } from "react";
import { Navigate, useNavigate, useParams } from "@/lib/router";
import { BarbellIcon, CheckCircleIcon } from "@phosphor-icons/react";
import type { Exercise } from "@/types";
import { equipmentMeta } from "@/types";
import { getExercise, setsForEquipment } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { formatClock } from "@/lib/format";
import { isNewRecord } from "@/lib/stats";
import { LIMITS } from "@/lib/schema";
import { useStore } from "@/hooks/use-store";
import { useNow } from "@/hooks/use-now";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { RestTimer } from "@/components/rest-timer";
import { SessionExerciseCard } from "@/components/session-exercise-card";
import { cn } from "@/lib/cn";

export const SessionScreen = () => {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);

  const session = store.sessions.find((s) => s.id === id);
  if (!session) return <Navigate to={paths.home} replace />;
  if (session.finishedAt !== null) {
    return <Navigate to={paths.sessionDetail(session.id)} replace />;
  }

  const workout = session.workoutId
    ? store.workouts.find((w) => w.id === session.workoutId)
    : null;
  const exercises = (workout?.exerciseIds ?? [])
    .map((exId) => getExercise(exId))
    .filter((e): e is Exercise => Boolean(e));

  const sessionSets = store.setsBySession.get(session.id) ?? [];
  const totalSets = sessionSets.length;
  const startedExercises = exercises.filter((ex) =>
    sessionSets.some((s) => s.exerciseId === ex.id),
  ).length;

  const finish = () => {
    store.finishSession(session.id);
    navigate(paths.sessionDetail(session.id), { replace: true });
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-accent-text">
              ● Ao vivo
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalSets}{" "}
              {totalSets === 1 ? "série registrada" : "séries registradas"}
            </p>
          </div>
          <p
            className="font-mono text-4xl leading-none font-bold tabular-nums"
            aria-label="Tempo de treino"
          >
            {formatClock((now - session.startedAt) / 1000)}
          </p>
        </div>
        {exercises.length > 0 && (
          <div
            role="progressbar"
            aria-label="Exercícios começados"
            aria-valuemin={0}
            aria-valuemax={exercises.length}
            aria-valuenow={startedExercises}
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${exercises.length}, minmax(0, 1fr))` }}
          >
            {exercises.map((ex, i) => (
              <span
                key={ex.id}
                className={cn("h-1.5 rounded-full", i < startedExercises ? "bg-accent" : "bg-muted")}
              />
            ))}
          </div>
        )}
      </div>

      {restStartedAt !== null && (
        <RestTimer
          key={restStartedAt}
          startedAt={restStartedAt}
          duration={store.restSeconds}
          onDurationChange={store.setRestSeconds}
          onDismiss={() => setRestStartedAt(null)}
        />
      )}

      {exercises.length === 0 ? (
        <EmptyState
          icon={BarbellIcon}
          title="Treino sem exercícios"
          description="Este treino não possui exercícios. Finalize e edite o treino para adicioná-los."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <SessionExerciseCard
              key={ex.id}
              exercise={ex}
              sets={sessionSets.filter((s) => s.exerciseId === ex.id)}
              history={store.setsByExercise.get(ex.id) ?? []}
              onAddSet={(equipment, load, reps) => {
                const loadType = equipmentMeta(equipment).loadType;
                const record = isNewRecord(
                  setsForEquipment(
                    store.setsByExercise.get(ex.id) ?? [],
                    ex,
                    equipment,
                  ),
                  loadType,
                  load,
                );
                store.addSet(ex.id, equipment, loadType, load, reps, session.id);
                setRestStartedAt(Date.now());
                return record;
              }}
              onUpdateSet={store.updateSet}
              onRemoveSet={store.removeSet}
            />
          ))}
        </ul>
      )}

      <div>
        <label
          htmlFor="session-note"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Observações do treino (opcional)
        </label>
        <textarea
          id="session-note"
          value={session.note ?? ""}
          onChange={(e) =>
            store.updateSession(session.id, { note: e.target.value })
          }
          rows={2}
          maxLength={LIMITS.sessionNote}
          placeholder="Como foi o treino? Dores, energia, sono..."
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <button
        onClick={finish}
        className="sticky bottom-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-extrabold text-accent-foreground shadow-[0_12px_40px_rgb(0_0_0/0.4)] font-stretch-semi-expanded"
      >
        <CheckCircleIcon size={20} weight="fill" />
        Finalizar treino
      </button>

      <button
        onClick={() => setConfirmDiscard(true)}
        className="mx-auto text-sm font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
      >
        Descartar sessão
      </button>

      {confirmDiscard && (
        <ConfirmDialog
          title="Descartar sessão?"
          description="As séries registradas nesta sessão serão apagadas e o treino não irá para o histórico."
          confirmLabel="Descartar"
          cancelLabel="Continuar treino"
          onConfirm={() => {
            store.removeSession(session.id);
            navigate(paths.home, { replace: true });
          }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
};
