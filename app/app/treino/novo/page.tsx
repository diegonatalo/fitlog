import { WorkoutForm } from "@/components/workout-form";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <WorkoutForm />;
}
