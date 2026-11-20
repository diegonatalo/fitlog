import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

// O canonical fica só nesta página e nas fixas: no layout ele apontaria "/" para todas as rotas
// e impediria gerar as rotas com id (o caminho relativo depende do id, que só existe na visita).
export const metadata: Metadata = { alternates: { canonical: "/app" } };

export default function Page() {
  return <HomePage />;
}
