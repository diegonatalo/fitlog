import type { Metadata } from "next";
import { SessionScreen } from "./session-screen";

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <SessionScreen />;
}
