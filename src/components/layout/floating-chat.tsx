"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, PackageSearch } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export function FloatingChat() {
  const settings = useSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Aparece tras un momento para no estorbar la primera impresión.
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      <Link
        href="/rastrear"
        aria-label="Rastrear mi pedido"
        title="Rastrear mi pedido"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 bg-background/90 text-accent shadow-[0_4px_18px_rgba(111,200,233,0.25)] backdrop-blur transition-transform hover:scale-110"
      >
        <PackageSearch className="h-5 w-5" />
      </Link>
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent("¡Hola! Tengo una duda sobre un producto 🛹")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
