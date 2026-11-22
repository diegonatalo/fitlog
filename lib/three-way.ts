/*
 * Three-way merge for saves from a screen that may be out of date:
 *
 * - `base`: what the screen had before the edit (absent for something new);
 * - `next`: what the screen sent;
 * - `current`: what is saved now (absent if it was deleted).
 *
 * Only what the screen changed is applied, so another device's edits stay.
 * `null` means that cannot be done without losing one of the edits.
 */

/** Same content, whatever the key order (`jsonb` does not keep it). */
const stable = (value: unknown): string =>
  JSON.stringify(value, (_, item: unknown) =>
    typeof item === "object" && item !== null && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );

export const same = (a: unknown, b: unknown) => a === b || stable(a) === stable(b);

export const CONFLICT = Symbol("conflict");

/** The value to keep for one field, or `CONFLICT` when both sides changed it differently. */
export const pick = <T>(base: T, next: T, current: T): T | typeof CONFLICT => {
  if (same(base, next) || same(next, current)) return current;
  return same(base, current) ? next : CONFLICT;
};

/** Merges one record, field by field. A field's value is never split. */
export const mergeRecord = <T extends object>(base: T | undefined, next: T, current: T | undefined): T | null => {
  if (!current) return base ? null : next;
  if (!base) return same(next, current) ? current : null;
  const [before, after, saved] = [base, next, current] as Record<string, unknown>[];
  const merged: Record<string, unknown> = { ...saved };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after), ...Object.keys(saved)])) {
    const value = pick(before[key], after[key], saved[key]);
    if (value === CONFLICT) return null;
    merged[key] = value;
  }
  return merged as T;
};

/**
 * Merges a list item by item, by `key`, keeping the order someone chose. Removing
 * what the other side edited is a conflict, like editing what it removed.
 */
export const mergeList = <T>(
  base: T[],
  next: T[],
  current: T[],
  key: (item: T) => string,
  mergeItem: (base: T | undefined, next: T, current: T | undefined) => T | null,
): T[] | null => {
  const byKey = (items: T[]) => new Map(items.map((item) => [key(item), item]));
  const [before, after, saved] = [byKey(base), byKey(next), byKey(current)];

  const result = new Map(saved);
  for (const [id, item] of after) {
    const old = before.get(id);
    if (old !== undefined && same(old, item)) continue; // this screen did not touch it
    const merged = mergeItem(old, item, saved.get(id));
    if (merged === null) return null;
    result.set(id, merged);
  }
  for (const [id, old] of before) {
    if (after.has(id)) continue;
    if (saved.has(id) && !same(old, saved.get(id))) return null;
    result.delete(id);
  }

  const common = (items: Map<string, T>) => [...items.keys()].filter((id) => before.has(id) && after.has(id) && saved.has(id));
  const [was, mine, theirs] = [common(before), common(after), common(saved)];
  const moved = !same(was, mine);
  if (moved && !same(was, theirs) && !same(mine, theirs)) return null;

  // whoever reordered gives the order; the other side's new items go after their neighbour
  const [lead, rest] = moved ? [after, saved] : [saved, after];
  const order = [...lead.keys()].filter((id) => result.has(id));
  const placed = new Set(order);
  let at = 0;
  for (const id of rest.keys()) {
    if (!result.has(id)) continue;
    if (placed.has(id)) {
      at = order.indexOf(id) + 1;
    } else {
      order.splice(at, 0, id);
      placed.add(id);
      at += 1;
    }
  }
  return order.map((id) => result.get(id) as T);
};
