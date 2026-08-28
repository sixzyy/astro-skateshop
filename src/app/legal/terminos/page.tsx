import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones — Astro SkateShop",
  description: "Términos y condiciones de uso de Astro SkateShop, tienda de skate en Colombia.",
};

export default function TerminosPage() {
  return (
    <LegalPage
      kicker="// protocolo legal"
      title="Términos y condiciones"
      updated="28 de agosto de 2026"
    >
      <LegalSection
        heading="1. Aceptación de los términos"
        paragraphs={[
          "Al acceder o comprar en astroskate.co (la «Tienda») aceptas estos términos y condiciones. Si no estás de acuerdo, por favor no uses la Tienda.",
          "Estos términos rigen las compras de productos de skate (tablas, trucks, ruedas, grip y accesorios) realizadas por clientes en el territorio de Colombia, conforme a la Ley 1480 de 2011 (Estatuto del Consumidor).",
        ]}
      />
      <LegalSection
        heading="2. Precios y pagos"
        paragraphs={[
          "Todos los precios están expresados en pesos colombianos (COP) e incluyen el IVA del 19% aplicable.",
          "Aceptamos pagos con tarjetas de crédito, débito y otros medios habilitados a través de nuestra pasarela de pagos. El comprobante de pago se genera una vez la pasarela confirma la transacción.",
          "En caso de un error de precios evidente, la Tienda podrá cancelar el pedido y reembolsar el valor pagado sin penalización.",
        ]}
      />
      <LegalSection
        heading="3. Pedidos y disponibilidad"
        paragraphs={[
          "La aceptación de un pedido está sujeta a la disponibilidad real de inventario en el momento del despacho.",
          "Si algún producto de tu pedido no está disponible, te contactaremos por los medios registrados para ofrecerte un cambio, el reenvío sin costo o el reembolso correspondiente.",
        ]}
      />
      <LegalSection
        heading="4. Obligaciones del cliente"
        list={[
          "Proporcionar datos de contacto y de envío veraces y exactos.",
          "Verificar la dirección antes de realizar el pago; Astro SkateShop no se hace responsable por direcciones incorrectas.",
          "Hacer uso del sitio para fines lícitos y no intentar vulnerar la seguridad de la Tienda.",
        ]}
      />
      <LegalSection
        heading="5. Propiedad intelectual"
        paragraphs={[
          "El contenido del sitio (textos, imágenes, logos y diseño) es propiedad de Astro SkateShop o de sus licenciantes. Queda prohibida su reproducción sin autorización expresa.",
        ]}
      />
      <LegalSection
        heading="6. Contacto"
        paragraphs={[
          "Para reclamaciones o preguntas escríbenos a hola@astroskate.co. Para quejas formales rige la normativa de protección al consumidor aplicable en Colombia.",
        ]}
      />
    </LegalPage>
  );
}