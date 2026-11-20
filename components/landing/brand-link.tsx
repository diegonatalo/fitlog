import Link from "next/link";
import { BarbellIcon } from "@phosphor-icons/react/ssr";

/** Marca do FitLog com link para a página inicial. */
export const BrandLink = () => (
  <Link href="/" aria-label="FitLog, página inicial" className="flex items-center gap-2.5 rounded-xl">
    <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
      <BarbellIcon size={22} weight="fill" />
    </span>
    <span className="text-lg font-bold tracking-tight">FitLog</span>
  </Link>
);
