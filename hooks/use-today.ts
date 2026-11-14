import { useSyncExternalStore } from "react";
import { dateKey } from "@/lib/dates";

const subscribe = (onChange: () => void) => {
  // the day can roll over while the app stays open
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
};

const getSnapshot = () => dateKey(new Date());

/** Today as a "YYYY-MM-DD" key; empty on the server and before hydration. */
export const useToday = (): string =>
  useSyncExternalStore(subscribe, getSnapshot, () => "");
