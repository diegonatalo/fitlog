"use client";

import { useEffect, type ReactNode } from "react";
import { StoreProvider } from "../context/StoreProvider";
import { AppShell } from "./AppShell";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // o suporte offline é opcional: falhar ao registrar não atrapalha o app
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
