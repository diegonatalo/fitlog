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
        description="Esta tela encontrou um erro inesperado. Seus treinos continuam salvos neste aparelho."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90"
            >
              Tentar de novo
            </button>
            <Link
              to="/"
              className="rounded-xl border border-border bg-background px-4 py-2.5 font-semibold hover:bg-muted"
            >
              Voltar ao início
            </Link>
          </div>
        }
      />
    </main>
  );
};
