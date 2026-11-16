import { createContext, useContext } from "react";
import type { Store } from "@/hooks/use-workout-store";

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
