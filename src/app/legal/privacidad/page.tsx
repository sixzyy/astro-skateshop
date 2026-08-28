import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad — Astro SkateShop",
  description: "Cómo recopilamos, usamos y protegemos tus datos en Astro SkateShop (Colombia).",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      kicker="// protocolo legal"
      title="Política de privacidad"
      updated="28 de agosto de 2026"
    >
      <LegalSection
        heading="1. Datos que recopilamos"
        paragraphs={[
          "Para procesar tus compras recopilamos: nombre, correo electrónico, dirección de envío, número de contacto e historial de pedidos.",
          "Los datos de tu tarjeta son procesados por nuestra pasarela de pagos; no almacenamos ni tenemos acceso a los datos completos de tu tarjeta.",
        ]}
      />
      <LegalSection
        heading="2. Uso de la información"
        list={[
          "Procesar y entregar tus pedidos, incluido el envío de confirmaciones por correo.",
          "Atención al cliente y gestión de garantías o devoluciones.",
          "Mejora de la experiencia de navegación y, con tu consentimiento, comunicación de novedades.",
        ]}
      />
      <LegalSection
        heading="3. Base legal y tus derechos"
        paragraphs={[
          "Tratamos tus datos conforme a la Ley 1581 de 2012. Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, así como a revocar la autorización de tratamiento, escribiendo a hola@astroskate.co.",
        ]}
      />
      <LegalSection
        heading="4. Retención"
        paragraphs={[
          "Conservamos tus datos mientras tengas cuenta activa o durante el tiempo exigido por la normativa fiscal y comercial colombiana.",
        ]}
      />
      <LegalSection
        heading="5. Menores de edad"
        paragraphs={[
          "El sitio está dirigido a mayores de edad. Las compras deben realizarse por un adulto responsable. No recopilamos intencionalmente datos de menores.",
        ]}
      />
      <LegalSection
        heading="6. Cookies y análisis"
        paragraphs={[
          "Usamos almacenamiento local para funcionalidades como el carrito y el Armador 3D. Podemos medir audiencia con herramientas de análisis anónimo para mejorar el sitio.",
        ]}
      />
    </LegalPage>
  );
}