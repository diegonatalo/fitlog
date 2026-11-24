"use client";

import { useState } from "react";
import { Navigate, useNavigate, useParams } from "@/lib/router";
import { BarbellIcon, CaretRightIcon, CheckIcon, FlagIcon } from "@phosphor-icons/react";
import type { Exercise } from "@/types";
import { equipmentMeta } from "@/types";
import { getExercise, setsForEquipment } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { formatClock, formatSet } from "@/lib/format";
import { previousSessionSets } from "@/lib/workout-stats";
import { isNewRecord } from "@/lib/stats";
import { LIMITS } from "@/lib/schema";
import { useStore } from "@/hooks/use-store";
import { useNow } from "@/hooks/use-now";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { RestTimer } from "@/components/rest-timer";
import { SessionExerciseCard } from "@/components/session-exercise-card";
import { cn } from "@/lib/cn";

// só chamada ao salvar uma série (num evento), nunca durante a renderização
const nowMs = () => Date.now();

export const SessionScreen = () => {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  // o exercício aberto; sem escolha, o primeiro que ainda não tem série
  const [chosenId, setChosenId] = useState<string | null>(null);

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
  const setsOf = (exerciseId: string) => sessionSets.filter((s) => s.exerciseId === exerciseId);
  const active =
    exercises.find((ex) => ex.id === chosenId) ??
    exercises.find((ex) => setsOf(ex.id).length === 0) ??
    exercises[0];
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
        <>
          <SessionExerciseCard
            key={active.id}
            exercise={active}
            position={exercises.indexOf(active) + 1}
            total={exercises.length}
            sets={setsOf(active.id)}
            history={store.setsByExercise.get(active.id) ?? []}
            previous={previousSessionSets(store.setsByExercise.get(active.id) ?? [], session.id)}
            onAddSet={(equipment, load, reps) => {
              const loadType = equipmentMeta(equipment).loadType;
              const record = isNewRecord(
                setsForEquipment(store.setsByExercise.get(active.id) ?? [], active, equipment),
                loadType,
                load,
              );
              // fica neste exercício: sem isso, ele sairia de "sem séries" e a tela pularia para o próximo
              setChosenId(active.id);
              store.addSet(active.id, equipment, loadType, load, reps, session.id);
              setRestStartedAt(nowMs());
              return record;
            }}
            onUpdateSet={store.updateSet}
            onRemoveSet={store.removeSet}
          />

          <OtherExercises
            title="A seguir"
            items={exercises.filter((ex) => ex !== active && setsOf(ex.id).length === 0)}
            describe={(ex) => {
              const lastSet = store.setsByExercise.get(ex.id)?.[0];
              return lastSet ? `última vez ${formatSet(lastSet)}` : "sem registros ainda";
            }}
            onPick={(ex) => setChosenId(ex.id)}
            position={(ex) => exercises.indexOf(ex) + 1}
          />
          <OtherExercises
            title="Feitos"
            items={exercises.filter((ex) => ex !== active && setsOf(ex.id).length > 0)}
            describe={(ex) => {
              const n = setsOf(ex.id).length;
              return `${n} ${n === 1 ? "série" : "séries"}`;
            }}
            onPick={(ex) => setChosenId(ex.id)}
            position={(ex) => exercises.indexOf(ex) + 1}
            done
          />
        </>
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
        className="sticky bottom-4 flex h-14 w-full items-center justify-center gap-2.5 rounded-[18px] border-[1.5px] border-accent-text bg-background text-base font-extrabold text-accent-text shadow-[0_12px_40px_rgb(0_0_0/0.4)] font-stretch-semi-expanded"
      >
        <FlagIcon size={20} weight="bold" />
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

type OtherExercisesProps = {
  title: string;
  items: Exercise[];
  describe: (exercise: Exercise) => string;
  onPick: (exercise: Exercise) => void;
  position: (exercise: Exercise) => number;
  done?: boolean;
};

/** Os outros exercícios do treino, como botões que abrem cada um. */
const OtherExercises = ({ title, items, describe, onPick, position, done = false }: OtherExercisesProps) => {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h2 className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{title}</h2>
      {items.map((ex) => (
        <button
          key={ex.id}
          onClick={() => onPick(ex)}
          aria-label={`Abrir ${ex.name}`}
          className="flex min-h-16 items-center gap-3 rounded-[20px] border border-border bg-card px-4 text-left hover:bg-muted/50"
        >
          <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
            {String(position(ex)).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{ex.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{describe(ex)}</span>
          </span>
          {done ? (
            <CheckIcon size={18} weight="bold" className="shrink-0 text-accent-text" aria-hidden="true" />
          ) : (
            <CaretRightIcon size={18} weight="bold" className="shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
      ))}
    </section>
  );
};

