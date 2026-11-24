"use client";

import { useMemo, useState } from "react";
import {
  CaretRightIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Link } from "@/lib/router";
import type { MuscleGroup } from "@/types";
import { MUSCLE_GROUPS, equipmentMeta } from "@/types";
import { EmptyState } from "@/components/empty-state";
import { EXERCISES } from "@/lib/exercises";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { formatSet } from "@/lib/format";
import { useStore } from "@/hooks/use-store";

export const LibraryPage = () => {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => filter === "all" || e.muscleGroup === filter)
      .filter((e) => (q ? e.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [query, filter]);

  // em grupos musculares, na ordem da lista de grupos
  const groups = useMemo(
    () =>
      MUSCLE_GROUPS.map((m) => ({
        ...m,
        items: filtered.filter((e) => e.muscleGroup === m.value),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  return (
    <div>
        <div className="relative mb-3">
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exercício..."
            aria-label="Buscar exercício"
            className="h-13 w-full rounded-2xl border border-input bg-card pl-11 pr-12 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
            >
              <XIcon size={16} weight="bold" />
            </button>
          )}
        </div>

        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
          <Chip
            label="Todos"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {MUSCLE_GROUPS.filter((m) =>
            EXERCISES.some((e) => e.muscleGroup === m.value),
          ).map((m) => (
            <Chip
              key={m.value}
              label={m.label}
              active={filter === m.value}
              onClick={() => setFilter(m.value)}
            />
          ))}
        </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="Nenhum exercício encontrado"
          description="Tente outro termo de busca ou remova o filtro de grupo muscular."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.value} aria-labelledby={`grupo-${g.value}`}>
              <h2
                id={`grupo-${g.value}`}
                className="mb-2.5 flex justify-between font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground"
              >
                <span>{g.label}</span>
                <span>{g.items.length}</span>
              </h2>
              <ul className="overflow-hidden rounded-[22px] border border-border bg-card">
                {g.items.map((ex, i) => {
                  const count = store.setsByExercise.get(ex.id)?.length ?? 0;
                  const last = store.setsByExercise.get(ex.id)?.[0];
                  return (
                    <li key={ex.id} className={cn(i > 0 && "border-t border-border")}>
                      <Link
                        to={paths.exercise(ex.id)}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">{ex.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {ex.equipments.map((q) => equipmentMeta(q).label).join(" · ")}
                            {count > 0 && ` · ${count} ${count === 1 ? "registro" : "registros"}`}
                          </span>
                        </span>
                        {count === 0 || !last ? (
                          <span className="shrink-0 text-xs text-muted-foreground">Sem registros</span>
                        ) : (
                          <span className="shrink-0 font-mono text-sm font-bold">{formatSet(last)}</span>
                        )}
                        <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" weight="bold" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

    </div>
  );
};

const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input text-foreground/80 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
};
