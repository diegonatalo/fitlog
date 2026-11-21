import { HistoryPage } from "@/components/history-page";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <HistoryPage />;
}
