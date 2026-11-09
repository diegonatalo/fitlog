import type { Metadata } from "next";
import { SessionDetail } from "@/components/session-detail";

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <SessionDetail />;
}
