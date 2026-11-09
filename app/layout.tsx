import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "FitLog | Monitore sua evolução";
const DESCRIPTION_OG =
  "Registre séries, monte treinos, bata recordes, calcule o gasto do cardio na esteira e acompanhe sua evolução. Grátis, offline e sem cadastro.";
const DESCRIPTION_TWITTER =
  "Registre séries, monte treinos, bata recordes, calcule o gasto do cardio na esteira e acompanhe sua evolução.";
const IMAGE_ALT = "FitLog: monitore sua evolução na academia";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: "Diego" }],
  robots: { index: true, follow: true, "max-image-preview": "large" },
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
    siteName: SITE_NAME,
    locale: "pt_BR",
    title: TITLE,
    description: DESCRIPTION_OG,
    images: [
      {
        url: "/og-image.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION_TWITTER,
    images: [{ url: "/og-image.png", alt: IMAGE_ALT }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14161d",
};

// aplica o tema salvo antes do primeiro paint, evitando flash de tema errado
const THEME_BEFORE_PAINT = `
(function () {
  try {
    var t = localStorage.getItem("fitlog:theme:v1");
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
          {THEME_BEFORE_PAINT}
        </Script>
        <noscript>O FitLog precisa de JavaScript para funcionar.</noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
