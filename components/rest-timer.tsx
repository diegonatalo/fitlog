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

  const progress = Math.max(0, Math.min(1, remaining / duration));
  const RING = 2 * Math.PI * 27;

  return (
    <div
      role="timer"
      className={cn(
        "flex flex-col gap-3 rounded-3xl p-4 transition-colors",
        done ? "bg-accent text-accent-foreground" : "border border-border bg-card",
      )}
    >
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
          <circle cx="32" cy="32" r="27" fill="none" strokeWidth="6" className="stroke-current opacity-15" />
          <circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - progress)}
            transform="rotate(-90 32 32)"
            className={done ? "stroke-current" : "stroke-accent"}
          />
          <TimerIcon x="22" y="22" size={20} weight="fill" />
        </svg>

        <div className="min-w-0 flex-1">
          <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.1em]", !done && "text-muted-foreground")}>
            {done ? "Descanso concluído" : "Descansando"}
          </p>
          <p className="font-mono text-[34px] leading-none font-bold tabular-nums">
            {done ? "Bora!" : formatClock(Math.ceil(remaining))}
          </p>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dispensar timer"
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-[14px]",
            done ? "bg-accent-foreground/10 hover:bg-accent-foreground/20" : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          <XIcon size={18} weight="bold" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDurationChange(duration - REST_STEP_SECONDS)}
            disabled={duration <= MIN_REST_SECONDS}
            aria-label="Diminuir descanso"
            className="grid size-9 place-items-center rounded-xl hover:bg-current/10 disabled:opacity-30"
          >
            <MinusIcon size={16} weight="bold" />
          </button>
          <span className="min-w-12 text-center font-mono text-sm font-bold" aria-label="Duração do descanso">
            {formatClock(duration)}
          </span>
          <button
            onClick={() => onDurationChange(duration + REST_STEP_SECONDS)}
            disabled={duration >= MAX_REST_SECONDS}
            aria-label="Aumentar descanso"
            className="grid size-9 place-items-center rounded-xl hover:bg-current/10 disabled:opacity-30"
          >
            <PlusIcon size={16} weight="bold" />
          </button>
        </div>
        <div className="flex gap-1">
          {REST_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => onDurationChange(p)}
              aria-pressed={p === duration}
              className={cn(
                "h-9 rounded-xl px-2.5 font-mono text-xs font-bold transition-colors",
                p === duration
                  ? done
                    ? "bg-accent-foreground text-accent"
                    : "bg-foreground text-background"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
