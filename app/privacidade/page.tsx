import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Privacidade | FitLog",
  description: "O FitLog guarda seus treinos na sua conta. Veja o que fica guardado, quem recebe e como apagar.",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <PrivacyPage />;
}
