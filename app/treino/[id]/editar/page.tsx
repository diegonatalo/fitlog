import type { Metadata } from "next";
import { WorkoutForm } from "@/app/treino/_components/workout-form";

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <WorkoutForm />;
}
