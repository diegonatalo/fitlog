import { BarbellIcon } from "@phosphor-icons/react/ssr";

/** Enquanto o servidor confere a sessão e carrega os treinos. */
export const AppLoading = () => {
  return (
    <div
      role="status"
      className="grid min-h-dvh place-items-center bg-background text-muted-foreground"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-12 animate-pulse place-items-center rounded-2xl bg-accent text-accent-foreground">
          <BarbellIcon size={26} weight="fill" />
        </span>
        <span className="text-sm font-medium">Carregando seus treinos…</span>
      </div>
    </div>
  );
};
