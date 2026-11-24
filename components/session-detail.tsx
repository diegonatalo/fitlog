"use client";

import { useState } from "react";
import {
  BarbellIcon,
  ClockCounterClockwiseIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Navigate, useNavigate, useParams } from "@/lib/router";
import type { WorkoutSet } from "@/types";
import { formatDuration, formatSet, formatTime, relativeDay } from "@/lib/format";
import { getExercise } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { useStore } from "@/hooks/use-store";
import { ConfirmDialog } from "@/components/confirm-dialog";

export const SessionDetail = () => {
  const store = useStore();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const session = store.sessions.find((s) => s.id === id);

  if (!session) return <Navigate to={paths.history} replace />;
  if (session.finishedAt === null) {
    return <Navigate to={paths.session(session.id)} replace />;
  }

  const sets = store.setsBySession.get(session.id) ?? [];

  const groups = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
    (acc[set.exerciseId] ??= []).push(set);
    return acc;
  }, {});

  const exerciseName = (exId: string) =>
    getExercise(exId)?.name ?? "Exercício removido";

  return (
    <div className="pb-24">
      <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-[26px] border border-border bg-card">
        <SummaryStat label="Séries" value={String(sets.length)} />
        <SummaryStat
          label="Exercícios"
          value={String(Object.keys(groups).length)}
        />
        <SummaryStat
          label="Duração"
          value={formatDuration(session.startedAt, session.finishedAt)}
        />
      </div>

      <p className="mb-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <ClockCounterClockwiseIcon size={14} weight="bold" />
        {relativeDay(session.startedAt)} ·{" "}
        {formatTime(session.startedAt)}
      </p>

      {session.note && (
        <p className="mb-4 flex gap-2 rounded-[18px] border border-border p-4 text-sm leading-relaxed text-foreground/85">
          <NotePencilIcon size={18} className="mt-0.5 shrink-0" />
          <span className="whitespace-pre-wrap">{session.note}</span>
        </p>
      )}

      {Object.keys(groups).length === 0 ? (
        <p className="rounded-3xl border border-dashed border-input p-6 text-center text-sm text-muted-foreground">
          Nenhuma série registrada nesta sessão.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {Object.entries(groups).map(([exerciseId, entries]) => (
            <div
              key={exerciseId}
              className="rounded-[20px] border border-border bg-card p-4"
            >
              <p className="mb-3 flex items-center gap-2 font-extrabold">
                <BarbellIcon size={18} weight="fill" className="text-accent-text" />
                {exerciseName(exerciseId)}
              </p>
              <ul className="flex flex-col gap-1.5">
                {entries.map((entry, i) => (
                  <li
                    key={entry.id}
                    className="border-b border-border/50 pb-1.5 text-sm last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Série {i + 1}
                      </span>
                      <span className="font-mono font-medium">
                        {formatSet(entry)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs italic text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setConfirmDelete(true)}
        className="mt-8 flex h-13 w-full items-center justify-center gap-1.5 rounded-2xl border border-destructive/40 text-sm font-bold text-destructive hover:bg-destructive/10"
      >
        <TrashIcon size={16} /> Excluir sessão
      </button>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir sessão?"
          description="A sessão e todas as séries registradas nela serão apagadas. Essa ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={() => {
            store.removeSession(session.id);
            navigate(paths.history, { replace: true });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};

const SummaryStat = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col-reverse gap-1.5 p-4 not-first:border-l not-first:border-border">
      <span className="font-mono text-2xl leading-none font-bold">{value}</span>
      <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
    </div>
  );
};
