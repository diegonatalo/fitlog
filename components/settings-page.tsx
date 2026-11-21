"use client";

import { useState, type ReactNode } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { EXERCISES } from "@/lib/exercises";
import { useStore } from "@/hooks/use-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CardioProfileForm } from "@/components/cardio-profile-form";
import { AccountSection } from "@/components/account-section";

export const SettingsPage = () => {
  const store = useStore();
  const [cleared, setCleared] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Conta"
        description="Seus dados ficam salvos nesta conta e aparecem em qualquer aparelho em que você entrar."
      >
        <AccountSection />
      </Section>

      <Section
        title="Perfil"
        description="Usado nas estimativas de calorias e frequência cardíaca da aba Cardio."
      >
        <CardioProfileForm />
      </Section>

      <Section
        title="Zona de perigo"
        description="Apaga treinos, sessões e registros da sua conta. A conta continua existindo."
      >
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 font-semibold text-destructive hover:bg-destructive/10"
        >
          <TrashIcon size={18} weight="bold" /> Apagar todos os dados
        </button>
        {cleared && (
          <p role="status" className="text-sm font-medium text-accent">
            Dados apagados.
          </p>
        )}
      </Section>

      <p className="text-center text-xs text-muted-foreground">
        FitLog · {EXERCISES.length} exercícios · {store.sets.length}{" "}
        séries · {store.finishedSessions.length} sessões
      </p>

      {confirmClear && (
        <ConfirmDialog
          title="Apagar todos os dados?"
          description="Treinos, séries, sessões, agenda e cardio são apagados para sempre. Essa ação não pode ser desfeita."
          confirmLabel="Apagar tudo"
          cancelLabel="Cancelar"
          onConfirm={() => {
            store.clearAll();
            setConfirmClear(false);
            setCleared(true);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
};
