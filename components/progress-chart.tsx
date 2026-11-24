import { ChartLineUpIcon } from "@phosphor-icons/react";
import type { LoadType, WorkoutSet } from "@/types";
import { dailyBest } from "@/lib/stats";
import { formatDate, formatLoad, loadParts } from "@/lib/format";

type ProgressChartProps = {
  sets: WorkoutSet[];
  loadType: LoadType;
  /** só o gráfico e as legendas, para ir dentro de outro card */
  bare?: boolean;
};

const W = 320;
const H = 120;
const PAD = { top: 12, right: 12, bottom: 12, left: 12 };
const MAX_POINTS = 20;

/** Best load per day, as a small line chart. Needs at least two days. */
export const ProgressChart = ({ sets, loadType, bare = false }: ProgressChartProps) => {
  const points = dailyBest(sets, loadType).slice(-MAX_POINTS);
  if (points.length < 2) return null;

  const loads = points.map((p) => p.load);
  const min = Math.min(...loads);
  const max = Math.max(...loads);
  const span = max - min || 1;

  const x = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const y = (load: number) =>
    PAD.top + (1 - (load - min) / span) * (H - PAD.top - PAD.bottom);

  const line = points.map((p, i) => `${x(i)},${y(p.load)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.load - first.load;

  const chart = (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Melhor carga por dia: de ${formatLoad(loadType, first.load)} em ${formatDate(first.day)} para ${formatLoad(loadType, last.load)} em ${formatDate(last.day)}`}
        className="h-auto w-full overflow-visible"
      >
        <polyline
          points={`${x(0)},${H - PAD.bottom} ${line} ${x(points.length - 1)},${H - PAD.bottom}`}
          fill="var(--accent)"
          fillOpacity={0.12}
          stroke="none"
        />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const latest = i === points.length - 1;
          return (
            <circle
              key={p.day}
              cx={x(i)}
              cy={y(p.load)}
              r={latest ? 5 : 3}
              fill={latest ? "var(--record)" : "var(--card)"}
              stroke={latest ? "var(--card)" : "var(--accent)"}
              strokeWidth={latest ? 2.5 : 2}
            />
          );
        })}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{formatDate(first.day)}</span>
        <span>
          {formatLoad(loadType, min)} – {formatLoad(loadType, max)}
        </span>
        <span>{formatDate(last.day)}</span>
      </div>
    </>
  );

  if (bare) return <div>{chart}</div>;

  return (
    <section className="rounded-[26px] border border-border bg-card p-[18px]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <ChartLineUpIcon size={18} /> Evolução
        </h2>
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {delta > 0 ? "+" : ""}
          {loadParts(loadType, delta).value} {loadParts(loadType, 0).unit}
        </span>
      </div>
      {chart}
    </section>
  );
};
