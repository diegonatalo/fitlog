"use client";

import { useEffect, type ReactNode } from "react";
import { StoreProvider } from "./store-provider";
import { AppShell } from "./app-shell";

export const Providers = ({ children }: { children: ReactNode }) => {
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
};
