import { Providers } from "@/components/providers";

/** O app mora em `/app`; a landing e as páginas legais ficam fora dele. */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <Providers>{children}</Providers>;
}
