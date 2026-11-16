import { useEffect, useState } from "react";

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

/**
 * useState mirrored to localStorage. `parse` turns what was stored (or null)
 * into valid data and must be a stable (module-level) function. Changes made
 * in other tabs are picked up through the `storage` event, so two open tabs
 * never overwrite each other with stale data.
 */
export function usePersistedState<T>(key: string, parse: (raw: unknown) => T) {
  const [state, setState] = useState<T>(() => parse(read(key)));

  useEffect(() => {
    write(key, state);
  }, [key, state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setState(parse(read(key)));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, parse]);

  return [state, setState] as const;
}
