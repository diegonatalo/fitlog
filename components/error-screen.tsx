"use client";

import { useEffect } from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/empty-state";
import { Link } from "@/lib/router";

type ErrorScreenProps = {
  error: unknown;
  retry: () => void;
};

export const ErrorScreen = ({ error, retry }: ErrorScreenProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <EmptyState
        icon={WarningIcon}
        title="Algo deu errado"
        description="Esta tela encontrou um erro inesperado. Seus treinos continuam salvos na sua conta."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="h-12 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground hover:opacity-90"
            >
              Tentar de novo
            </button>
            <Link
              to="/"
              className="inline-flex h-12 items-center rounded-2xl border border-input px-5 font-bold hover:bg-muted"
            >
              Voltar ao início
            </Link>
          </div>
        }
      />
    </main>
  );
};
