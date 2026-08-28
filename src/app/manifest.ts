import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Astro SkateShop — Tienda de skate en Colombia",
    short_name: "Astro",
    description:
      "Tablas, trucks, ruedas, grip y accesorios de skate con envíos a toda Colombia. Arma tu setup en 3D.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1424",
    theme_color: "#0b1424",
    categories: ["shopping", "sports"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}