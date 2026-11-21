import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Providers } from "@/components/providers";
import { loadAppData } from "@/lib/data/queries";
import { paths } from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";

/**
 * Confere a sessão e carrega os dados da pessoa antes de abrir o app. Fica
 * dentro de um <Suspense> no layout, porque lê os cookies da requisição.
 */
export const SignedInApp = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  // cookie velho ou sessão expirada: o proxy deixou passar, aqui não
  if (!user) redirect(paths.signIn);
  const data = await loadAppData(user.id);
  return (
    <Providers initialData={data} account={{ name: user.name, email: user.email }}>
      {children}
    </Providers>
  );
};
