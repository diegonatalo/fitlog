"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useWorkoutStore, type Persistence } from "@/hooks/use-workout-store";
import { AccountContext, StoreContext, type Account } from "@/hooks/use-store";
import type { AppData } from "@/lib/schema";
import * as actions from "@/lib/data/actions";

const noopSubscribe = () => () => {};

const persistence: Persistence = actions;

type Props = {
  initialData: AppData;
  account: Account;
  children: ReactNode;
};

/**
 * Os dados chegam do servidor já carregados. As telas ainda são desenhadas só
 * no navegador porque várias dependem da data e da hora de quem está usando:
 * no servidor (e na hidratação) sai vazio, e o HTML sempre coincide.
 */
export const StoreProvider = ({ initialData, account, children }: Props) => {
  const store = useWorkoutStore(initialData, persistence);
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return null;
  return (
    <AccountContext value={account}>
      <StoreContext value={store}>{children}</StoreContext>
    </AccountContext>
  );
};
