import type { Metadata } from "next";
import { WorkoutForm } from "@/components/workout-form";

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <WorkoutForm />;
}
