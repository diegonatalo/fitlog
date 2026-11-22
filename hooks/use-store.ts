import { createContext, useContext } from "react";
import type { Store } from "@/hooks/use-workout-store";

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

/** The signed-in person, as shown in the app (never the session itself). */
export type Account = { id: string; name: string; email: string };

export const AccountContext = createContext<Account | null>(null);

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount must be used inside <StoreProvider>");
  return account;
}
