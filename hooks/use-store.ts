import { useContext } from "react";
import { StoreContext } from "@/lib/store-context";

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
