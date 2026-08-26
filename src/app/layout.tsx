import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CustomStarCursor } from "@/components/fx/custom-star-cursor";
import { FloatingChat } from "@/components/layout/floating-chat";
import { ScrollRevealProvider } from "@/components/fx/scroll-reveal-provider";
import { HydrationSuppressor } from "@/components/fx/hydration-suppressor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "ASTRO — Skateshop & Streetwear",
    template: "%s | ASTRO",
  },
  description:
    "Skate y streetwear premium. Tablas, trucks, ruedas, tenis y ropa de marca. Armador 3D. Envio gratis desde $999 MXN.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "ASTRO Skateshop",
    url: BASE,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased" suppressHydrationWarning>
        <HydrationSuppressor />
        <Script
          id="bitdefender-strip"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(){function r(e){e.removeAttribute("bis_skin_checked");for(var c=e.firstElementChild;c;c=c.firstElementChild)r(c)}function s(){r(document.body);new MutationObserver(function(a){for(var m of a)for(var n of m.addedNodes)n.nodeType===1&&r(n)}).observe(document.body,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s()}()`,
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <CustomStarCursor />
        <ScrollRevealProvider />
        <FloatingChat />
      </body>
    </html>
  );
}
