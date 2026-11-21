"use client";

import { useState } from "react";
import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAccount } from "@/hooks/use-store";
import { authClient } from "@/lib/auth-client";

/**
 * Navegação completa de propósito, não `router.push`: descarta o store e o
 * cache do roteador, para nada da conta ficar na memória da aba depois de sair.
 */
const leave = () => window.location.assign(new URL("/", window.location.origin));

export const AccountSection = () => {
  const account = useAccount();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const signOut = async () => {
    setPending(true);
    setError(null);
    const { error } = await authClient.signOut().catch(() => ({ error: true }));
    if (error) {
      setPending(false);
      setError("Não foi possível sair. Verifique sua conexão e tente de novo.");
      return;
    }
    leave();
  };

  const deleteAccount = async () => {
    setConfirmDelete(false);
    setPending(true);
    setError(null);
    const { error } = await authClient
      .deleteUser()
      .catch(() => ({ error: { code: "NETWORK" } }));
    if (error) {
      setPending(false);
      setError(
        error && typeof error === "object" && error.code === "SESSION_EXPIRED"
          ? "Por segurança, saia e entre de novo antes de excluir a conta."
          : "Não foi possível excluir a conta. Tente de novo.",
      );
      return;
    }
    leave();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <UserCircleIcon size={36} weight="duotone" className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{account.name}</p>
          <p className="truncate text-sm text-muted-foreground">{account.email}</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={signOut}
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 font-semibold hover:bg-muted disabled:opacity-60"
        >
          <SignOutIcon size={20} weight="bold" /> Sair
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="rounded-xl border border-destructive/40 py-3 font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
        >
          Excluir conta
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Excluir sua conta?"
          description="A conta e todos os treinos, séries, sessões e dados do cardio são apagados para sempre. Essa ação não pode ser desfeita."
          confirmLabel="Excluir conta"
          cancelLabel="Cancelar"
          onConfirm={deleteAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};
