import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";

export const metadata: Metadata = {
  title: "Entrar | FitLog",
  description: "Entre na sua conta do FitLog para ver seus treinos, séries e histórico.",
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-in" />;
}
