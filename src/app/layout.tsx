import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CustomStarCursor } from "@/components/fx/custom-star-cursor";
import { FloatingChat } from "@/components/layout/floating-chat";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Astro Skateshop — Patinando sobre la gravedad",
    template: "%s | Astro Skateshop",
  },
  description:
    "Skateshop cósmico: tablas con constelaciones, ruedas planetarias y equipo de skate real. Envío gratis desde $999 COP.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Astro SkateShop",
    url: BASE,
  },
  twitter: { card: "summary_large_image" },
  applicationName: "Astro SkateShop",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "Astro SkateShop",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1424",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased" suppressHydrationWarning>
        <Script
          id="bitdefender-strip"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(){function r(e){e.removeAttribute("bis_skin_checked");for(var c=e.firstElementChild;c;c=c.firstElementChild)r(c)}function s(){r(document.body);new MutationObserver(function(a){for(var m of a)for(var n of m.addedNodes)n.nodeType===1&&r(n)}).observe(document.body,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s()}()`,
          }}
        />
        {process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN && (
          <Script
            id="plausible-analytics"
            strategy="afterInteractive"
            data-domain={process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <CustomStarCursor />
        <FloatingChat />
      </body>
    </html>
  );
}
