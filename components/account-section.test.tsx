import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountContext } from "@/hooks/use-store";

const authClient = vi.hoisted(() => ({
  signOut: vi.fn(),
  deleteUser: vi.fn(),
}));
vi.mock("@/lib/auth-client", () => ({ authClient }));

import { AccountSection } from "./account-section";

const assign = vi.fn();

const setup = () =>
  render(
    <AccountContext value={{ id: "ana", name: "Ana", email: "ana@exemplo.com" }}>
      <AccountSection />
    </AccountContext>,
  );

beforeEach(() => {
  vi.stubGlobal("location", { origin: "http://localhost:3000", assign });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AccountSection", () => {
  it("mostra nome e e-mail da conta", () => {
    setup();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
  });

  it("sair encerra a sessão e volta para a página inicial", async () => {
    authClient.signOut.mockResolvedValue({ error: null });
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(authClient.signOut).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith(new URL("http://localhost:3000/"));
  });

  it("se sair falhar, avisa e fica na tela", async () => {
    authClient.signOut.mockRejectedValue(new Error("offline"));
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível sair.");
    expect(assign).not.toHaveBeenCalled();
  });

  it("excluir a conta pede confirmação; cancelar não apaga nada", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Excluir conta" }));
    expect(screen.getByRole("alertdialog", { name: "Excluir sua conta?" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(authClient.deleteUser).not.toHaveBeenCalled();
  });

  const confirmWith = async (password: string) => {
    await userEvent.click(screen.getByRole("button", { name: "Excluir conta" }));
    const dialog = screen.getByRole("alertdialog");
    await userEvent.type(screen.getByLabelText("Sua senha"), password);
    await userEvent.click(dialog.querySelector("button[type=submit]") as HTMLElement);
  };

  it("sem a senha, o botão de excluir fica desabilitado", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Excluir conta" }));
    expect(screen.getByRole("alertdialog").querySelector("button[type=submit]")).toBeDisabled();
  });

  it("confirmar com a senha exclui a conta e sai do app", async () => {
    authClient.deleteUser.mockResolvedValue({ error: null });
    setup();
    await confirmWith("minha-senha-123");
    expect(authClient.deleteUser).toHaveBeenCalledWith({
      password: "minha-senha-123",
      fetchOptions: { headers: { "x-account-id": "ana" } },
    });
    expect(assign).toHaveBeenCalledWith(new URL("http://localhost:3000/"));
  });

  it("senha errada avisa e não sai", async () => {
    authClient.deleteUser.mockResolvedValue({ error: { code: "INVALID_PASSWORD" } });
    setup();
    await confirmWith("errada-123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Senha incorreta");
    expect(assign).not.toHaveBeenCalled();
  });

  it("se outra conta entrou, avisa e não sai", async () => {
    authClient.deleteUser.mockResolvedValue({ error: { code: "ACCOUNT_CHANGED" } });
    setup();
    await confirmWith("minha-senha-123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Outra conta entrou");
    expect(assign).not.toHaveBeenCalled();
  });
});
