import { LogoMark } from "@/components/logo";

/** Enquanto o servidor confere a sessão e carrega os treinos. */
export const AppLoading = () => {
  return (
    <div
      role="status"
      className="grid min-h-dvh place-items-center bg-background text-muted-foreground"
    >
      <div className="flex flex-col items-center gap-3">
        <LogoMark size={48} className="animate-pulse" />
        <span className="text-sm font-medium">Carregando seus treinos…</span>
      </div>
    </div>
  );
};
