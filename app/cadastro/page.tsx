import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";

export const metadata: Metadata = {
  title: "Criar conta | FitLog",
  description: "Crie sua conta grátis no FitLog e registre seus treinos em qualquer aparelho.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-up" />;
}
