import type { Schedule } from "@/types";
import { addDays, parseKey, weekdayOf } from "./dates";
import { resolvePlan } from "./schedule";

/** Letras dos dias, indexadas como Date#getDay (domingo = 0). */
const WEEKDAY_LETTER = ["D", "S", "T", "Q", "Q", "S", "S"];

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const WEEKDAY_FULL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export type WeekDayStatus =
  /** houve treino terminado neste dia */
  | "done"
  /** havia treino planejado e o dia passou sem treino */
  | "missed"
  /** treino planejado, hoje ou adiante */
  | "planned"
  | "rest"
  | "free";

export type WeekDay = {
  key: string;
  letter: string;
  day: number;
  isToday: boolean;
  status: WeekDayStatus;
};

/**
 * Os sete dias da semana de `today`, de domingo a sábado, como na agenda.
 * Um treino feito conta mais que o plano do dia.
 */
export function weekStrip(today: string, schedule: Schedule, doneDays: ReadonlySet<string>): WeekDay[] {
  const sunday = addDays(today, -weekdayOf(today));
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(sunday, i);
    const plan = resolvePlan(schedule, key)?.plan;
    let status: WeekDayStatus = "free";
    if (doneDays.has(key)) status = "done";
    else if (plan?.type === "rest") status = "rest";
    else if (plan?.type === "workout") status = key < today ? "missed" : "planned";
    return { key, letter: WEEKDAY_LETTER[i], day: parseKey(key).getDate(), isToday: key === today, status };
  });
}

/** "terça · 24 nov", para o topo da tela inicial. */
export function shortDayLabel(key: string): string {
  const d = parseKey(key);
  return `${WEEKDAY_FULL[d.getDay()]} · ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}
