import type { Metadata } from "next";
import { TermsPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Termos de uso | FitLog",
  description: "As regras para usar o FitLog. Não é orientação médica nem de treino.",
  alternates: { canonical: "/termos" },
};

export default function Page() {
  return <TermsPage />;
}
