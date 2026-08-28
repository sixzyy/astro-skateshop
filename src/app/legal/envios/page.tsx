import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de envíos — Astro SkateShop",
  description: "Costos, tiempos y cobertura de envíos de Astro SkateShop en Colombia.",
};

export default function EnviosPage() {
  return (
    <LegalPage
      kicker="// protocolo legal"
      title="Política de envíos"
      updated="28 de agosto de 2026"
    >
      <LegalSection
        heading="1. Cobertura"
        paragraphs={[
          "Realizamos envíos a todo el territorio colombiano. Los tiempos estimados se cuentan en días hábiles desde la confirmación del pago y varían según la ciudad de destino.",
        ]}
      />
      <LegalSection
        heading="2. Costos"
        list={[
          "El envío tiene un costo fijo según la zona de entrega, calculado al finalizar la compra.",
          "Los pedidos cuyo valor supere el umbral indicado en la tienda acceden a envío gratis.",
          "El costo exacto siempre se muestra antes de confirmar el pago.",
        ]}
      />
      <LegalSection
        heading="3. Tiempos estimados"
        paragraphs={[
          "Procesamos los pedidos en un máximo de 2 días hábiles. Los tiempos de entrega dependen del transportador y del destino; publicamos rangos orientativos en el correo de confirmación.",
        ]}
      />
      <LegalSection
        heading="4. Seguimiento"
        paragraphs={[
          "Al despachar tu pedido recibirás un correo con la información de seguimiento. Si tienes dudas sobre una entrega, escríbenos a hola@astroskate.co.",
        ]}
      />
    </LegalPage>
  );
}