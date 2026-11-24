"use client";

import { useEffect } from "react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
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
    <main id="conteudo" className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center gap-4 px-6 py-10">
      <p aria-hidden="true" className="font-mono text-[88px] leading-none font-bold tracking-tighter text-border">
        0 × 0
      </p>
      <h1 className="text-4xl leading-[1.05] font-extrabold font-stretch-expanded">Algo deu errado</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        Esta tela encontrou um erro inesperado. Seus treinos continuam salvos na sua conta.
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => retry()}
          className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-primary text-base font-extrabold text-primary-foreground font-stretch-semi-expanded hover:opacity-90"
        >
          <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
          Tentar de novo
        </button>
        <Link
          to="/"
          className="flex h-14 items-center justify-center rounded-[18px] border border-input font-bold hover:bg-muted"
        >
          Ir para o início
        </Link>
      </div>
    </main>
  );
};
