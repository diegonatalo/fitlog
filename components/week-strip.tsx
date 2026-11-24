import { CheckIcon } from "@phosphor-icons/react";
import type { WeekDay, WeekDayStatus } from "@/lib/week";
import { cn } from "@/lib/cn";

const STATUS_LABEL: Record<WeekDayStatus, string | null> = {
  done: "treino feito",
  missed: "treino planejado não feito",
  planned: "treino planejado",
  rest: "descanso",
  free: null,
};

/** A semana atual em sete casas, com o que foi feito e o que está planejado. */
export const WeekStrip = ({ days }: { days: WeekDay[] }) => (
  <ol aria-label="Esta semana" className="grid grid-cols-7 gap-1.5">
    {days.map((d) => {
      const label = [String(d.day), d.isToday ? "hoje" : null, STATUS_LABEL[d.status]].filter(Boolean).join(", ");
      return (
        <li
          key={d.key}
          aria-current={d.isToday ? "date" : undefined}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-2.5",
            d.isToday ? "border-accent bg-card" : "border-transparent",
          )}
        >
          <span className="sr-only">{label}</span>
          <span aria-hidden="true" className="text-[11px] font-semibold text-muted-foreground">
            {d.letter}
          </span>
          <span aria-hidden="true" className="font-mono text-[15px] font-bold">
            {d.day}
          </span>
          <span aria-hidden="true" className="grid h-3.5 place-items-center">
            {d.status === "done" ? (
              <span className="grid size-3.5 place-items-center rounded-full bg-accent text-accent-foreground">
                <CheckIcon size={9} weight="bold" />
              </span>
            ) : (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  d.status === "planned" && "bg-foreground",
                  d.status === "missed" && "border border-muted-foreground",
                  (d.status === "rest" || d.status === "free") && "bg-border",
                )}
              />
            )}
          </span>
        </li>
      );
    })}
  </ol>
);
