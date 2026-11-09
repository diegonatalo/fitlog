"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { StoreContext } from "@/lib/store-context";

const noopSubscribe = () => () => {};

/**
 * Os dados ficam no localStorage, que o servidor não enxerga. Por isso o app
 * só é desenhado no navegador: no servidor (e na hidratação) sai vazio, e assim
 * o HTML e a primeira renderização do cliente sempre coincidem.
 */
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useWorkoutStore();
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return null;
  return <StoreContext value={store}>{children}</StoreContext>;
};
