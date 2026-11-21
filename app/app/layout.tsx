import { Suspense } from "react";
import { AppLoading } from "@/components/app-loading";
import { SignedInApp } from "@/components/signed-in-app";

/**
 * O app mora em `/app` e pede login; a landing e as páginas legais ficam fora dele.
 * A sessão é lida dentro do <Suspense>, então a tela de carregamento sai na hora.
 */
// Todo o app depende da sessão, que só existe na requisição: não há casca
// estática para validar como navegação instantânea.
export const instant = false;

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense fallback={<AppLoading />}>
      <SignedInApp>{children}</SignedInApp>
    </Suspense>
  );
}
