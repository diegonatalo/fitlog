import { createContext } from "react";
import type { Store } from "@/hooks/use-workout-store";

export const StoreContext = createContext<Store | null>(null);
