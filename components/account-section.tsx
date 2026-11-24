"use client";

import { useState } from "react";
import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAccount } from "@/hooks/use-store";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_HEADER, deleteErrorMessage } from "@/lib/auth-form";

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
  const [password, setPassword] = useState("");

  const closeDelete = () => {
    setConfirmDelete(false);
    setPassword("");
  };

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
    const typed = password;
    closeDelete();
    setPending(true);
    setError(null);
    const { error } = await authClient
      .deleteUser({ password: typed, fetchOptions: { headers: { [ACCOUNT_HEADER]: account.id } } })
      .catch(() => ({ error: { code: "NETWORK" } }));
    if (error) {
      setPending(false);
      setError(deleteErrorMessage(error.code));
      return;
    }
    leave();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-13 shrink-0 place-items-center rounded-[18px] bg-accent text-xl font-extrabold text-accent-foreground font-stretch-expanded">
          {account.name.trim().charAt(0).toUpperCase() || <UserCircleIcon size={28} weight="fill" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold">{account.name}</p>
          <p className="truncate text-sm text-muted-foreground">{account.email}</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={signOut}
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-input font-bold hover:bg-muted disabled:opacity-60"
        >
          <SignOutIcon size={20} weight="bold" /> Sair
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="h-12 rounded-2xl bg-destructive/15 font-bold text-destructive hover:bg-destructive/25 disabled:opacity-60"
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
          onCancel={closeDelete}
          confirmDisabled={!password}
        >
          <label htmlFor="delete-password" className="text-sm font-semibold">
            Sua senha
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-13 w-full rounded-2xl border border-input bg-background px-4"
          />
        </ConfirmDialog>
      )}
    </div>
  );
};
