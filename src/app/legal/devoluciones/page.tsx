import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cambios y devoluciones — Astro SkateShop",
  description: "Política de cambios y devoluciones de Astro SkateShop, conforme a la Ley 1480 de 2011.",
};

export default function DevolucionesPage() {
  return (
    <LegalPage
      kicker="// protocolo legal"
      title="Cambios y devoluciones"
      updated="28 de agosto de 2026"
    >
      <LegalSection
        heading="1. Retracto (Ley 1480 de 2011)"
        paragraphs={[
          "Dispones de 5 días hábiles desde la entrega para ejercer el derecho de retracto, siempre que el producto no haya sido usado y conserve su empaque y etiquetas originales.",
          "Para ejercerlo escríbenos a hola@astroskate.co indicando tu número de pedido. El reembolso se procesa al verificar que el producto llegó en perfecto estado.",
        ]}
      />
      <LegalSection
        heading="2. Productos defectuosos"
        paragraphs={[
          "Los productos cuentan con garantía legal. Si tu producto llega dañado o presenta fallas de fabricación, contáctanos dentro de los primeros 30 días para gestionar el cambio sin costo.",
        ]}
      />
      <LegalSection
        heading="3. Cambio de talla o medida"
        paragraphs={[
          "Aceptamos cambios por talla o medida dentro de los 30 días de la compra, sujeto a disponibilidad de inventario. El costo del envío del cambio corre por cuenta del cliente, salvo error nuestro.",
        ]}
      />
      <LegalSection
        heading="4. Excepciones"
        list={[
          "Producto usado, rayado o con señales de montaje.",
          "Grip ya aplicado o láminas despegadas.",
          "Falta de empaque o etiquetas originales.",
        ]}
      />
    </LegalPage>
  );
}