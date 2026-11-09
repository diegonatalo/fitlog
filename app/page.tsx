import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

// O canonical fica só na página inicial: no layout ele apontaria "/" para todas as rotas
// e impediria gerar as rotas com id (o caminho relativo depende do id, que só existe na visita).
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return <HomePage />;
}
