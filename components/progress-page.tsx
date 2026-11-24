"use client";

import { useMemo } from "react";
import { CaretRightIcon, FireIcon, TrophyIcon } from "@phosphor-icons/react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/cn";
import { dateKey } from "@/lib/dates";
import { getExercise } from "@/lib/exercises";
import { formatSet, relativeDay } from "@/lib/format";
import { paths } from "@/lib/paths";
import {
  consistencyGrid,
  consistencySummary,
  previousBest,
  recentRecords,
  weekOverWeek,
  weekStreak,
  weeklyVolume,
} from "@/lib/progress";
import { useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";

const VOLUME_WEEKS = 8;
const GRID_WEEKS = 12;

const card = "rounded-[28px] border border-border bg-card p-5 lg:p-6";

/** "12,4 t" nos rótulos das barras, "850 kg" abaixo de uma tonelada */
const shortVolume = (kg: number) =>
  kg >= 1000 ? `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t` : `${kg.toLocaleString("pt-BR")}`;

export const ProgressPage = () => {
  const store = useStore();
  const today = useToday();

  const data = useMemo(() => {
    if (!today) return null;
    const trained = new Set(store.finishedSessions.map((s) => dateKey(new Date(s.startedAt))));
    const volume = weeklyVolume(store.sets, today, VOLUME_WEEKS);
    return {
      volume,
      total: volume.reduce((n, w) => n + w.volume, 0),
      delta: weekOverWeek(volume),
      grid: consistencyGrid(trained, today, GRID_WEEKS),
      streak: weekStreak(trained, today),
      records: recentRecords(store.sets, 5).map((r) => ({ ...r, before: previousBest(store.sets, r) })),
      summary: consistencySummary(store.finishedSessions, today, GRID_WEEKS),
    };
  }, [today, store.finishedSessions, store.sets]);

  if (!data) return null;
  const max = Math.max(1, ...data.volume.map((w) => w.volume));

  return (
    // telas largas: volume e consistência lado a lado, recordes numa tabela embaixo
    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-5">
      <section aria-labelledby="volume" className={card}>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h2 id="volume" className="text-xs font-semibold text-muted-foreground">
              Volume nas últimas {VOLUME_WEEKS} semanas
            </h2>
            <p className="font-mono text-4xl leading-none font-bold lg:text-5xl">
              {data.total.toLocaleString("pt-BR")}
              <span className="text-lg text-muted-foreground"> kg</span>
            </p>
          </div>
          {data.delta !== null && (
            <p
              className={cn(
                "rounded-[10px] px-2.5 py-1.5 text-[13px] font-bold",
                data.delta >= 0 ? "bg-accent/15 text-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {data.delta >= 0 ? "▲" : "▼"} {Math.abs(data.delta)}%
              <span className="sr-only"> em relação à semana passada</span>
            </p>
          )}
        </div>
        <ol aria-label="Volume por semana" className="mt-5 grid h-36 grid-cols-8 items-end gap-2 lg:h-56 lg:gap-3.5">
          {data.volume.map((w, i) => {
            const current = i === data.volume.length - 1;
            return (
              <li key={w.start} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="sr-only">
                  {current ? "Esta semana" : `Semana de ${w.start.slice(8)}/${w.start.slice(5, 7)}`}:{" "}
                  {w.volume.toLocaleString("pt-BR")} kg
                </span>
                <span aria-hidden="true" className="hidden font-mono text-xs text-muted-foreground lg:block">
                  {shortVolume(w.volume)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn("block h-(--bar) w-full rounded-lg lg:h-(--bar-lg) lg:rounded-[10px]", current ? "bg-accent" : "bg-input")}
                  style={{
                    ["--bar" as string]: `${Math.max(4, (w.volume / max) * 112)}px`,
                    ["--bar-lg" as string]: `${Math.max(4, (w.volume / max) * 160)}px`,
                  }}
                />
                <span aria-hidden="true" className="font-mono text-[10px] text-muted-foreground">
                  {current ? "agora" : `${w.start.slice(8)}/${w.start.slice(5, 7)}`}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="consistencia" className={cn(card, "flex flex-col gap-4")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="consistencia" className="text-xs font-semibold text-muted-foreground">
            Consistência · {GRID_WEEKS} semanas
          </h2>
          <p className="flex items-center gap-1 text-[13px] font-bold">
            <FireIcon size={15} weight="fill" className="text-record" aria-hidden="true" />
            <span className="font-mono">{data.streak}</span>{" "}
            {data.streak === 1 ? "semana seguida" : "semanas seguidas"}
          </p>
        </div>
        <div role="img" aria-label="Dias com treino nas últimas 12 semanas" className="grid grid-flow-col grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-7 gap-1">
          {data.grid.flat().map((d) => (
            <span
              key={d.key}
              className={cn(
                "aspect-square rounded-[5px]",
                d.future ? "border border-dashed border-border" : d.trained ? "bg-accent" : "bg-muted",
              )}
            />
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3.5">
          <Summary value={String(data.summary.sessions)} label={data.summary.sessions === 1 ? "treino" : "treinos"} />
          <Summary value={data.summary.perWeek.toLocaleString("pt-BR")} label="por semana" />
          <Summary
            value={data.summary.averageMinutes === null ? "—" : String(data.summary.averageMinutes)}
            label="min em média"
          />
        </dl>
      </section>

      <section
        aria-labelledby="recordes"
        className="mt-3 flex flex-col gap-2.5 lg:col-span-2 lg:mt-0 lg:gap-0 lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-border lg:bg-card"
      >
        <h2
          id="recordes"
          className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground lg:px-6 lg:pt-5 lg:pb-3"
        >
          Recordes recentes
        </h2>
        {data.records.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-input p-5 text-center text-sm text-muted-foreground lg:m-6 lg:mt-0">
            Quando você superar uma marca, ela aparece aqui.
          </p>
        ) : (
          <>
          <table className="hidden w-full border-collapse lg:table">
            <thead>
              <tr className="text-left font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                <th scope="col" className="pb-2.5 pl-6 font-medium">Exercício</th>
                <th scope="col" className="pb-2.5 font-medium">Quando</th>
                <th scope="col" className="pb-2.5 font-medium">Antes</th>
                <th scope="col" className="pr-6 pb-2.5 text-right font-medium">Recorde</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-3.5 pl-6">
                    <Link to={paths.exercise(r.exerciseId)} className="inline-flex items-center gap-3 font-bold hover:underline">
                      <span className="grid size-8.5 shrink-0 place-items-center rounded-[11px] bg-record/15 text-record">
                        <TrophyIcon size={16} weight="fill" aria-hidden="true" />
                      </span>
                      {getExercise(r.exerciseId)?.name ?? "Exercício"}
                    </Link>
                  </td>
                  <td className="text-sm text-muted-foreground">{relativeDay(r.createdAt)}</td>
                  <td className="font-mono text-sm text-muted-foreground">{r.before ? formatSet(r.before) : "—"}</td>
                  <td className="pr-6 text-right font-mono font-bold text-record">{formatSet(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="flex flex-col gap-2 lg:hidden">
            {data.records.map((r) => (
              <li key={r.id}>
                <Link
                  to={paths.exercise(r.exerciseId)}
                  className="flex items-center gap-3 rounded-[20px] border border-border bg-card px-3.5 py-3 hover:bg-muted/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-record/15 text-record">
                    <TrophyIcon size={18} weight="fill" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{getExercise(r.exerciseId)?.name ?? "Exercício"}</span>
                    <span className="block text-xs text-muted-foreground">{relativeDay(r.createdAt)}</span>
                  </span>
                  <span className="shrink-0 font-mono font-bold">{formatSet(r)}</span>
                  <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
          </>
        )}
      </section>
    </div>
  );
};

const Summary = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col-reverse gap-0.5">
    <dt className="text-[11px] text-muted-foreground">{label}</dt>
    <dd className="font-mono text-xl font-bold">{value}</dd>
  </div>
);
