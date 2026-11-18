import type { LoadTypeMeta } from "@/types";

export type SetInput = {
  load: number;
  reps: number;
  valid: boolean;
};

/**
 * Reads the load and reps fields of a set. Time-based load types have no
 * reps and count as 1. Shared by the log form and the edit dialog so both
 * accept exactly the same values.
 */
export const parseSetInput = (
  load: string,
  reps: string,
  meta: Pick<LoadTypeMeta, "allowZero" | "hasReps">,
): SetInput => {
  const loadNum = Number.parseFloat(load);
  const repsNum = meta.hasReps ? Number.parseInt(reps, 10) : 1;
  const valid =
    Number.isFinite(loadNum) &&
    (meta.allowZero ? loadNum >= 0 : loadNum > 0) &&
    Number.isInteger(repsNum) &&
    repsNum > 0;
  return { load: loadNum, reps: repsNum, valid };
};
