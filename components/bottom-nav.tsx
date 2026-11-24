"use client";

import {
  BarbellIcon,
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  HouseIcon,
  PersonSimpleRunIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";

const ITEMS: { to: string; label: string; icon: typeof HouseIcon }[] = [
  { to: paths.home, label: "Início", icon: HouseIcon },
  { to: paths.schedule, label: "Agenda", icon: CalendarBlankIcon },
  { to: paths.workouts, label: "Treinos", icon: BarbellIcon },
  { to: paths.history, label: "Histórico", icon: ClockCounterClockwiseIcon },
  { to: paths.cardio, label: "Cardio", icon: PersonSimpleRunIcon },
];

/** Barra flutuante: a aba ativa vira uma pílula verde com o nome; as outras mostram só o ícone. */
export const BottomNav = () => {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex h-[68px] w-full max-w-lg items-center gap-1 rounded-3xl border border-border bg-card/95 px-2 shadow-[0_12px_40px_rgb(0_0_0/0.35)] backdrop-blur-md">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              href={to}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-extrabold transition-[flex-grow,background-color,color] duration-200",
                active
                  ? "flex-[1.7] bg-accent text-accent-foreground"
                  : "flex-1 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={active ? 20 : 22} weight={active ? "fill" : "regular"} />
              {active && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
