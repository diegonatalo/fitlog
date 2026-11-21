import { WorkoutsPage } from "@/components/workouts-page";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <WorkoutsPage />;
}
