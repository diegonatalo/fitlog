import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

const TITULO = "FitLog | Monitore sua evolução";
const DESCRICAO =
  "FitLog é o diário de treino que cabe no bolso: registre séries, monte treinos, bata recordes, estime calorias e frequência cardíaca na esteira e acompanhe sua evolução. Grátis, offline e sem cadastro.";
const DESCRICAO_OG =
  "Registre séries, monte treinos, bata recordes, calcule o gasto do cardio na esteira e acompanhe sua evolução. Grátis, offline e sem cadastro.";
const DESCRICAO_TWITTER =
  "Registre séries, monte treinos, bata recordes, calcule o gasto do cardio na esteira e acompanhe sua evolução.";
const ALT_IMAGEM = "FitLog: monitore sua evolução na academia";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITULO,
  description: DESCRICAO,
  authors: [{ name: "Diego" }],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "FitLog",
    statusBarStyle: "black-translucent",
  },
  other: { "mobile-web-app-capable": "yes" },
  openGraph: {
    type: "website",
    siteName: "FitLog",
    locale: "pt_BR",
    url: "/",
    title: TITULO,
    description: DESCRICAO_OG,
    images: [
      {
        url: "/og-image.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: ALT_IMAGEM,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO_TWITTER,
    images: [{ url: "/og-image.png", alt: ALT_IMAGEM }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14161d",
};

// aplica o tema salvo antes do primeiro paint, evitando flash de tema errado
const TEMA_ANTES_DO_PAINT = `
(function () {
  try {
    var t = localStorage.getItem("treino-log:theme:v1");
    var dark =
      t === "dark" ||
      (t !== "light" && !window.matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.classList.toggle("dark", dark);
    if (!dark) {
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", "#f4f6f9");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // a classe "dark" é aplicada pelo script abaixo, antes da hidratação
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script id="tema" strategy="beforeInteractive">
          {TEMA_ANTES_DO_PAINT}
        </Script>
        <noscript>O FitLog precisa de JavaScript para funcionar.</noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
