import { cn } from "@/lib/cn";

type LogoMarkProps = {
  size?: number;
  /** "lime": quadrado verde e haltere escuro; "ink": o contrário, para usar sobre o verde. */
  tone?: "lime" | "ink";
  className?: string;
};

/** O haltere da marca. Decorativo: quem usa dá o nome acessível ao link ou botão. */
export const LogoMark = ({ size = 34, tone = "lime", className }: LogoMarkProps) => {
  const [bg, fg] = tone === "lime" ? ["#c6f24e", "#0b0d10"] : ["#0b0d10", "#c6f24e"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="18" fill={bg} />
      <g fill={fg}>
        <rect x="7" y="24" width="6" height="16" rx="3" />
        <rect x="14.5" y="15" width="9" height="34" rx="4.5" />
        <rect x="23" y="28.5" width="18" height="7" rx="3.5" />
        <rect x="40.5" y="15" width="9" height="34" rx="4.5" />
        <rect x="51" y="24" width="6" height="16" rx="3" />
      </g>
    </svg>
  );
};

type LogoProps = LogoMarkProps & { wordClassName?: string };

/** Símbolo e nome "FitLog" em Archivo larga. */
export const Logo = ({ size = 34, tone, className, wordClassName }: LogoProps) => (
  <span className={cn("inline-flex items-center", className)} style={{ gap: Math.round(size * 0.28) }}>
    <LogoMark size={size} tone={tone} />
    <span
      className={cn("font-extrabold leading-none tracking-tight font-stretch-expanded", wordClassName)}
      style={{ fontSize: Math.round(size * 0.62) }}
    >
      FitLog
    </span>
  </span>
);
