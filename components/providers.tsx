"use client";

import { useEffect, type ReactNode } from "react";
import type { Account } from "@/hooks/use-store";
import type { AppData } from "@/lib/schema";
import { StoreProvider } from "./store-provider";
import { AppShell } from "./app-shell";

type Props = {
  initialData: AppData;
  account: Account;
  children: ReactNode;
};

export const Providers = ({ initialData, account, children }: Props) => {
  useEffect(() => {
    // o cache é opcional: falhar ao registrar não atrapalha o app
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <StoreProvider initialData={initialData} account={account}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
};
