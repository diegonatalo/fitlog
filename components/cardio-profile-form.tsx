import { useState } from "react";
import type { CardioProfile, Sex } from "@/types";
import { Stepper } from "./stepper";
import { cn } from "@/lib/cn";
import { useStore } from "@/hooks/use-store";

const SEXES: { value: Sex; label: string }[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

const WEIGHT = { min: 30, max: 300 };
const AGE = { min: 10, max: 100 };

function parse(
  weight: string,
  age: string,
  sex: Sex | null,
): CardioProfile | null {
  const weightKg = Number.parseFloat(weight);
  const years = Number.parseFloat(age);
  const inRange = (n: number, r: { min: number; max: number }) =>
    Number.isFinite(n) && n >= r.min && n <= r.max;
  if (!inRange(weightKg, WEIGHT) || !inRange(years, AGE) || !sex) return null;
  return { weightKg, age: years, sex };
}

/** Body data for the cardio estimates; saves as soon as everything is valid. */
export const CardioProfileForm = () => {
  const { cardioProfile, saveCardioProfile } = useStore();
  const [weight, setWeight] = useState(
    cardioProfile ? String(cardioProfile.weightKg) : "",
  );
  const [age, setAge] = useState(cardioProfile ? String(cardioProfile.age) : "");
  const [sex, setSex] = useState<Sex | null>(cardioProfile?.sex ?? null);

  const update = (w: string, a: string, s: Sex | null) => {
    setWeight(w);
    setAge(a);
    setSex(s);
    const parsed = parse(w, a, s);
    if (parsed) saveCardioProfile(parsed);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Stepper
          label="Peso (kg)"
          value={weight}
          onChange={(v) => update(v, age, sex)}
          step={0.5}
          min={WEIGHT.min}
          placeholder="—"
        />
        <Stepper
          label="Idade (anos)"
          value={age}
          onChange={(v) => update(weight, v, sex)}
          step={1}
          min={AGE.min}
          placeholder="—"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
          Sexo (usado na estimativa da FC máxima)
        </p>
        <div role="group" aria-label="Sexo" className="grid grid-cols-2 gap-1 rounded-[14px] bg-background p-1">
          {SEXES.map((s) => (
            <button
              key={s.value}
              onClick={() => update(weight, age, s.value)}
              aria-pressed={sex === s.value}
              className={cn(
                "h-10 rounded-[10px] text-sm transition-colors",
                sex === s.value
                  ? "bg-muted font-extrabold text-foreground"
                  : "font-semibold text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
