import { useEffect, useRef } from "react";
import { MinusIcon, PlusIcon, TimerIcon, XIcon } from "@phosphor-icons/react";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/format";
import {
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  REST_PRESETS,
  REST_STEP_SECONDS,
} from "@/lib/rest";

type RestTimerProps = {
  /** when the rest started; changes every time a new set is saved */
  startedAt: number;
  /** rest length in seconds; kept by the parent so it survives new sets */
  duration: number;
  onDurationChange: (seconds: number) => void;
  onDismiss: () => void;
};

/** Countdown that starts after each saved set and buzzes when it ends. */
export const RestTimer = ({
  startedAt,
  duration,
  onDurationChange,
  onDismiss,
}: RestTimerProps) => {
  const now = useNow(250);
  const remaining = duration - (now - startedAt) / 1000;
  const done = remaining <= 0;
  const buzzedFor = useRef<number | null>(null);

  useEffect(() => {
    if (done && buzzedFor.current !== startedAt) {
      buzzedFor.current = startedAt;
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [done, startedAt]);

  return (
    <div
      role="timer"
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3",
        done ? "border-accent bg-accent/15" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          done ? "bg-accent text-accent-foreground" : "bg-muted",
        )}
      >
        <TimerIcon size={22} weight="fill" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {done ? "Descanso concluído" : "Descansando"}
        </p>
        <p className="font-mono text-2xl font-bold leading-none">
          {done ? "Bora!" : formatClock(Math.ceil(remaining))}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDurationChange(duration - REST_STEP_SECONDS)}
            disabled={duration <= MIN_REST_SECONDS}
            aria-label="Diminuir descanso"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <MinusIcon size={14} weight="bold" />
          </button>
          <span
            className="min-w-12 text-center font-mono text-xs font-semibold"
            aria-label="Duração do descanso"
          >
            {formatClock(duration)}
          </span>
          <button
            onClick={() => onDurationChange(duration + REST_STEP_SECONDS)}
            disabled={duration >= MAX_REST_SECONDS}
            aria-label="Aumentar descanso"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <PlusIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="flex gap-1">
          {REST_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => onDurationChange(p)}
              aria-pressed={p === duration}
              className={cn(
                "rounded-lg px-2 py-1 font-mono text-xs font-semibold transition-colors",
                p === duration
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dispensar timer"
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <XIcon size={16} weight="bold" />
      </button>
    </div>
  );
};
