import { useEffect, useState } from "react";
import { CheckIcon, FloppyDiskIcon, TrophyIcon } from "@phosphor-icons/react";
import type { Equipment } from "@/types";
import { equipmentMeta, loadTypeMeta } from "@/types";
import { EquipmentToggle } from "./equipment-toggle";
import { Stepper } from "./stepper";
import { cn } from "@/lib/cn";

export type SetSuggestion = {
  load: number;
  reps: number;
};

type LogFormProps = {
  equipments: Equipment[];
  equipment: Equipment;
  onEquipmentChange: (equipment: Equipment) => void;
  /** pre-fills the inputs, usually with the last set made with this equipment */
  suggestion?: SetSuggestion;
  /** return true when the saved set is a new personal record */
  onSave: (load: number, reps: number) => boolean | void;
  /** drops the card chrome and title, for use inside another card */
  bare?: boolean;
};

type Feedback = "saved" | "record" | null;

export const LogForm = ({
  equipments,
  equipment,
  onEquipmentChange,
  suggestion,
  onSave,
  bare = false,
}: LogFormProps) => {
  const initialLoad = suggestion ? String(suggestion.load) : "";
  const initialReps = suggestion ? String(suggestion.reps) : "";
  const [load, setLoad] = useState(initialLoad);
  const [reps, setReps] = useState(initialReps);
  const [seenEquipment, setSeenEquipment] = useState(equipment);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 1400);
    return () => window.clearTimeout(id);
  }, [feedback]);

  // switching equipment restarts the inputs from that equipment's last set
  if (seenEquipment !== equipment) {
    setSeenEquipment(equipment);
    setLoad(initialLoad);
    setReps(initialReps);
  }

  const meta = loadTypeMeta(equipmentMeta(equipment).loadType);
  const loadNum = Number.parseFloat(load);
  const repsNum = meta.hasReps ? Number.parseInt(reps, 10) : 1;
  const valid =
    Number.isFinite(loadNum) &&
    (meta.allowZero ? loadNum >= 0 : loadNum > 0) &&
    Number.isInteger(repsNum) &&
    repsNum > 0;

  const submit = () => {
    if (!valid) return;
    const isRecord = onSave(loadNum, repsNum);
    // values stay in place: the next set is usually close to this one
    setFeedback(isRecord ? "record" : "saved");
  };

  return (
    <section
      className={cn(!bare && "rounded-2xl border border-border bg-card p-4")}
    >
      {!bare && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Registrar série
        </h2>
      )}

      {equipments.length > 1 && (
        <EquipmentToggle
          options={equipments}
          value={equipment}
          onChange={onEquipmentChange}
        />
      )}

      <div
        className={cn(
          "mt-4 grid gap-3",
          meta.hasReps ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        <Stepper
          label={meta.loadLabel}
          value={load}
          onChange={setLoad}
          step={meta.step}
        />
        {meta.hasReps && (
          <Stepper
            label="Repetições"
            value={reps}
            onChange={(v) => setReps(v.replace(/[^\d]/g, ""))}
            step={1}
          />
        )}
      </div>

      <button
        onClick={submit}
        disabled={!valid}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
          feedback
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {feedback === "record" ? (
          <>
            <TrophyIcon size={20} weight="fill" /> Novo recorde!
          </>
        ) : feedback === "saved" ? (
          <>
            <CheckIcon size={20} weight="bold" /> Salvo!
          </>
        ) : (
          <>
            <FloppyDiskIcon size={20} weight="bold" /> Salvar
          </>
        )}
      </button>
    </section>
  );
};
