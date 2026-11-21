import type { Metadata } from "next";
import { WorkoutDetail } from "@/components/workout-detail";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <WorkoutDetail />;
}
