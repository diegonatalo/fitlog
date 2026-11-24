import { useState } from "react";
import type { WorkoutSet } from "@/types";
import { dateKey, parseKey } from "@/lib/dates";
import { formatSet } from "@/lib/format";
import { recordIds } from "@/lib/stats";
import { cn } from "@/lib/cn";
import { EditSetDialog } from "./edit-set-dialog";

type HistoryListProps = {
  sets: WorkoutSet[];
  onRemoveSet: (id: string) => void;
  onUpdateSet: (id: string, patch: { load: number; reps: number; note: string }) => void;
};

const MONTH = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/** Os registros de um exercício, um card por dia, com cada série como um chip que abre a edição. */
export const HistoryList = ({ sets, onRemoveSet, onUpdateSet }: HistoryListProps) => {
  const [editing, setEditing] = useState<WorkoutSet | null>(null);
  const records = recordIds(sets);

  // sets vem do mais novo ao mais antigo; dentro do dia, as séries vão na ordem em que foram feitas
  const days: { key: string; sets: WorkoutSet[] }[] = [];
  for (const s of sets) {
    const key = dateKey(new Date(s.createdAt));
    const day = days.find((d) => d.key === key);
    if (day) day.sets.unshift(s);
    else days.push({ key, sets: [s] });
  }

  return (
    <section aria-labelledby="registros" className="flex flex-col gap-2.5">
      <h2
        id="registros"
        className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground"
      >
        Registros
      </h2>

      {sets.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-input py-10 text-center text-sm text-muted-foreground">
          Nenhuma série registrada ainda.
          <br />
          Salve a primeira acima.
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {days.map((day) => {
            const date = parseKey(day.key);
            return (
              <li key={day.key} className="flex items-start gap-3.5 rounded-[20px] border border-border bg-card p-3.5">
                <span className="flex w-10 shrink-0 flex-col items-center pt-0.5">
                  <span className="font-mono text-xl leading-none font-bold">{date.getDate()}</span>
                  <span className="text-[11px] font-bold text-muted-foreground">{MONTH[date.getMonth()]}</span>
                </span>
                <ul className="flex flex-1 flex-wrap gap-1.5">
                  {day.sets.map((s) => {
                    const record = records.has(s.id);
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => setEditing(s)}
                          aria-label={`Editar registro: ${formatSet(s)}${record ? ", recorde" : ""}`}
                          className={cn(
                            "min-h-9 rounded-[10px] px-2.5 font-mono text-[13px] font-bold",
                            record ? "bg-record/15 text-record" : "bg-muted text-foreground",
                          )}
                        >
                          {formatSet(s)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      )}

      {editing && (
        <EditSetDialog
          set={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onUpdateSet(editing.id, patch);
            setEditing(null);
          }}
          onRemove={() => {
            onRemoveSet(editing.id);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
};
