import Link from "next/link";
import { Logo } from "@/components/logo";

/** Marca do FitLog com link para a página inicial. */
export const BrandLink = () => (
  <Link href="/" aria-label="FitLog, página inicial" className="rounded-xl">
    <Logo size={34} />
  </Link>
);
