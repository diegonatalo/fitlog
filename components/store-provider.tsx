"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useWorkoutStore, type Persistence } from "@/hooks/use-workout-store";
import { AccountContext, StoreContext, type Account } from "@/hooks/use-store";
import type { AppData } from "@/lib/schema";
import * as actions from "@/lib/data/actions";

const noopSubscribe = () => () => {};

/** As ações presas ao dono dos dados: com outra conta logada, o servidor recusa. */
const persistenceFor = (owner: string): Persistence => ({
  saveSet: (set, before) => actions.saveSet(owner, set, before),
  deleteSet: (id) => actions.deleteSet(owner, id),
  saveWorkout: (workout, before) => actions.saveWorkout(owner, workout, before),
  deleteWorkout: (id) => actions.deleteWorkout(owner, id),
  saveSession: (session, before) => actions.saveSession(owner, session, before),
  deleteSession: (id) => actions.deleteSession(owner, id),
  saveCardioSession: (session) => actions.saveCardioSession(owner, session),
  deleteCardioSession: (id) => actions.deleteCardioSession(owner, id),
  saveSchedule: (schedule, before) => actions.saveSchedule(owner, schedule, before),
  saveCardioProfile: (profile, before) => actions.saveCardioProfile(owner, profile, before),
  saveRestSeconds: (seconds) => actions.saveRestSeconds(owner, seconds),
  clearAllData: () => actions.clearAllData(owner),
});

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
export const StoreProvider = ({ initialData, account: initialAccount, children }: Props) => {
  // congelada junto com o store, que também só lê os dados iniciais uma vez
  const [account] = useState(initialAccount);
  const [persistence] = useState(() => persistenceFor(account.id));
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
