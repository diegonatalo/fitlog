import type { Metadata } from "next";
import { ExerciseDetail } from "./exercise-detail";

// ids vêm do navegador: qualquer id responde 200, então fica fora do índice
export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <ExerciseDetail />;
}
