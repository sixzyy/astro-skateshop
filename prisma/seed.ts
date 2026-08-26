import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaMssql({
    server: process.env.MSSQL_HOST ?? "localhost",
    port: Number(process.env.MSSQL_PORT ?? 1433),
    database: process.env.MSSQL_DB ?? "astro_skateshop",
    user: process.env.MSSQL_USER ?? "",
    password: process.env.MSSQL_PASSWORD ?? "",
    options: { encrypt: true, trustServerCertificate: true },
  }),
});

const SEED_ART: Record<string, string> = {
  "vx-dot": "tablas",
  "element-section": "tablas",
  "mob-grip": "grips",
  "jessup-grip": "grips",
  "indys-stage11": "trucks",
  "thunder-team": "trucks",
  "spitfire-f4": "ruedas",
  "oj-elite": "ruedas",
  "vans-oldskool": "tenis",
  "sb-force58": "tenis",
  "thrasher-hoodie": "ropa",
  "sc-hand-shirt": "ropa",
};

const img = (seed: string) => `/products/${SEED_ART[seed] ?? "generic"}.svg`;

const main = async () => {
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const clientPassword = await bcrypt.hash("cliente123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@astroskate.mx" },
    update: {},
    create: {
      email: "admin@astroskate.mx",
      name: "Admin Astro",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "cliente@demo.mx" },
    update: {},
    create: {
      email: "cliente@demo.mx",
      name: "Cliente Demo",
      passwordHash: clientPassword,
      role: "CLIENT",
    },
  });

  const brandNames = ["Santa Cruz", "Independent", "Spitfire", "Element", "Vans", "Nike SB", "Thrasher"];
  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    });
    brands[name] = brand.id;
  }

  const categoryNames = [
    { name: "Tablas", icon: "skateboard" },
    { name: "Grips", icon: "grip" },
    { name: "Trucks", icon: "truck" },
    { name: "Ruedas", icon: "wheels" },
    { name: "Tenis", icon: "shoes" },
    { name: "Ropa", icon: "shirt" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, slug: c.name.toLowerCase() },
    });
    categories[c.name] = category.id;
  }

  const products = [
    {
      name: 'Tabla Santa Cruz VX Classic Dot 8.0"',
      slug: "tabla-santa-cruz-vx-classic-dot-80",
      description:
        "Tabla de maple de 5 capas con tecnología VX: fibra de vidrio y resina para mayor pop y durabilidad. El clásico Classic Dot de Santa Cruz nunca pasa de moda.",
      price: 1899,
      compareAtPrice: 2299,
      images: [img("vx-dot"), img("vx-dot"), img("vx-dot")],
      specs: { Construcción: "Maple + Fibra de Vidrio VX", Tamaños: '7.75" / 8.0" / 8.25"', Origen: "EE.UU." },
      featured: true,
      published: true,
      categoryId: categories["Tablas"],
      brandId: brands["Santa Cruz"],
      variants: [
        { title: '7.75"', sku: "SC-VX775", stock: 6 },
        { title: '8.0"', sku: "SC-VX800", stock: 10 },
        { title: '8.25"', sku: "SC-VX825", stock: 4 },
      ],
    },
    {
      name: 'Tabla Element Section 8.25"',
      slug: "tabla-element-section-825",
      description:
        "La icónica sección de Element en maple hidropress de 7 capas. Liviana, con buen concave y el estilo atemporal que caracteriza a la marca.",
      price: 1599,
      compareAtPrice: null,
      images: [img("element-section"), img("element-section")],
      specs: { Construcción: "Maple 7 capas", Tamaños: '8.0" / 8.25"' },
      featured: false,
      published: true,
      categoryId: categories["Tablas"],
      brandId: brands["Element"],
      variants: [
        { title: '8.0"', sku: "EL-SEC800", stock: 5 },
        { title: '8.25"', sku: "EL-SEC825", stock: 2 },
      ],
    },
    {
      name: "Grip Mob Grip Clear Sheet",
      slug: "grip-mob-clear-sheet",
      description:
        "Grip transparente de alta tracción con adhesivo reforzado. Se adapta perfectamente al nose y tail sin despegarse.",
      price: 349,
      compareAtPrice: null,
      images: [img("mob-grip")],
      specs: { Material: "SiC cristalino", Tamaño: '9" x 33"' },
      featured: false,
      published: true,
      categoryId: categories["Grips"],
      brandId: brands["Independent"],
      variants: [{ title: "Estándar", sku: "MOB-CLR", stock: 24 }],
    },
    {
      name: "Grip Jessup Ultragrip",
      slug: "grip-jessup-ultragrip",
      description:
        "El grip original desde 1975. Grano de silicio carbide ultra adherente, corte fácil y pegamento resistente al clima.",
      price: 279,
      compareAtPrice: 329,
      images: [img("jessup-grip")],
      specs: { Material: "Silicio carbide", Tamaño: '9" x 33"' },
      featured: false,
      published: true,
      categoryId: categories["Grips"],
      brandId: brands["Independent"],
      variants: [{ title: "Negro", sku: "JS-BLK", stock: 30 }],
    },
    {
      name: "Trucks Independent Stage 11 Forged Hollow",
      slug: "trucks-independent-stage-11-forged-hollow",
      description:
        "Los trucks más confiables del skate. Eje forjado hueco, más ligeros sin perder resistencia. Kingpin de acero grado aeronáutico.",
      price: 1749,
      compareAtPrice: null,
      images: [img("indys-stage11"), img("indys-stage11")],
      specs: { Eje: "Acero forjado hueco", Altura: "Media", Par: "Par de trucks" },
      featured: true,
      published: true,
      categoryId: categories["Trucks"],
      brandId: brands["Independent"],
      variants: [
        { title: "139mm", sku: "IND-S11-139", stock: 8 },
        { title: "144mm", sku: "IND-S11-144", stock: 6 },
        { title: "149mm", sku: "IND-S11-149", stock: 3 },
      ],
    },
    {
      name: "Trucks Thunder Team Lights 148",
      slug: "trucks-thunder-team-lights-148",
      description:
        "Thunder Team Lights: eje hueco titanio-coated, giro rápido y respuesta inmediata para technical skating.",
      price: 1599,
      compareAtPrice: null,
      images: [img("thunder-team")],
      specs: { Eje: "Hueco", Altura: "Baja" },
      featured: false,
      published: true,
      categoryId: categories["Trucks"],
      brandId: brands["Independent"],
      variants: [
        { title: "147mm", sku: "TH-TL-147", stock: 4 },
        { title: "151mm", sku: "TH-TL-151", stock: 0 },
      ],
    },
    {
      name: "Ruedas Spitfire F4 99D Conical Full",
      slug: "ruedas-spitfire-f4-99d-conical-full",
      description:
        "Formula Four: el uretano anti-flat-spot más probado del mundo. Deslizamientos controlados y velocidad sostenida.",
      price: 999,
      compareAtPrice: null,
      images: [img("spitfire-f4"), img("spitfire-f4")],
      specs: { Dureza: "99A", Forma: "Conical Full", Set: "4 ruedas" },
      featured: true,
      published: true,
      categoryId: categories["Ruedas"],
      brandId: brands["Spitfire"],
      variants: [
        { title: '52mm / 99D', sku: "SP-F4-52", stock: 9 },
        { title: '54mm / 99D', sku: "SP-F4-54", stock: 12 },
        { title: '56mm / 99D', sku: "SP-F4-56", stock: 7 },
      ],
    },
    {
      name: "Ruedas OJ Elite Mini Combo 101A",
      slug: "ruedas-oj-elite-mini-combo-101a",
      description:
        "Mini combo dura 101A para park y street técnico. Uretano Elite con núcleo liviano y agarre en curva.",
      price: 849,
      compareAtPrice: 949,
      images: [img("oj-elite")],
      specs: { Dureza: "101A", Set: "4 ruedas" },
      featured: false,
      published: true,
      categoryId: categories["Ruedas"],
      brandId: brands["Spitfire"],
      variants: [
        { title: '52mm / 101A', sku: "OJ-MC-52", stock: 6 },
        { title: '53mm / 101A', sku: "OJ-MC-53", stock: 2 },
      ],
    },
    {
      name: "Tenis Vans Old Skool Pro",
      slug: "tenis-vans-old-skool-pro",
      description:
        "El clásico lateral waffle con refuerzos Pro: Duracap en zonas de desgaste, plantilla PopCush y suela SickStick.",
      price: 1799,
      compareAtPrice: 2099,
      images: [img("vans-oldskool"), img("vans-oldskool"), img("vans-oldskool")],
      specs: { Suela: "Wafflecup SickStick", Plantilla: "PopCush", Refuerzo: "Duracap" },
      featured: true,
      published: true,
      categoryId: categories["Tenis"],
      brandId: brands["Vans"],
      variants: [
        { title: "MX 26.5 (8 US)", sku: "VN-OS-8", stock: 5 },
        { title: "MX 28 (9 US)", sku: "VN-OS-9", stock: 7 },
        { title: "MX 29 (10 US)", sku: "VN-OS-10", stock: 6 },
        { title: "MX 30 (11 US)", sku: "VN-OS-11", stock: 3 },
      ],
    },
    {
      name: "Tenis Nike SB Force 58",
      slug: "tenis-nike-sb-force-58",
      description:
        "Diseñados con feedback de riders: upper de lona vulcanizada, zoom air en el talón y flexión natural.",
      price: 1649,
      compareAtPrice: null,
      images: [img("sb-force58"), img("sb-force58")],
      specs: { Amortiguación: "Zoom Air", Upper: "Lona vulcanizada" },
      featured: false,
      published: true,
      categoryId: categories["Tenis"],
      brandId: brands["Nike SB"],
      variants: [
        { title: "MX 26.5 (8 US)", sku: "NK-58-8", stock: 4 },
        { title: "MX 28 (9 US)", sku: "NK-58-9", stock: 0 },
        { title: "MX 29 (10 US)", sku: "NK-58-10", stock: 5 },
      ],
    },
    {
      name: "Hoodie Thrasher Flame Logo",
      slug: "hoodie-thrasher-flame-logo",
      description:
        "El flame logo original de Thrasher en hoodie pesado de algodón. Interior perchado, impresión puff resistente.",
      price: 1299,
      compareAtPrice: 1499,
      images: [img("thrasher-hoodie"), img("thrasher-hoodie")],
      specs: { Material: "Algodón 80% / Poly 20%", Gramaje: "330 gsm", Fit: "Regular" },
      featured: true,
      published: true,
      categoryId: categories["Ropa"],
      brandId: brands["Thrasher"],
      variants: [
        { title: "S", sku: "TH-HOOD-S", stock: 4 },
        { title: "M", sku: "TH-HOOD-M", stock: 8 },
        { title: "L", sku: "TH-HOOD-L", stock: 6 },
        { title: "XL", sku: "TH-HOOD-XL", stock: 2 },
      ],
    },
    {
      name: "Playera Santa Cruz Screaming Hand",
      slug: "playera-santa-cruz-screaming-hand",
      description:
        "El arte de Jim Phillips que definió una generación. Algodón premium con serigrafía suave al tacto.",
      price: 649,
      compareAtPrice: null,
      images: [img("sc-hand-shirt")],
      specs: { Material: "Algodón peinado 100%", Fit: "Regular" },
      featured: false,
      published: true,
      categoryId: categories["Ropa"],
      brandId: brands["Santa Cruz"],
      variants: [
        { title: "M", sku: "SC-HAND-M", stock: 7 },
        { title: "L", sku: "SC-HAND-L", stock: 5 },
        { title: "XL", sku: "SC-HAND-XL", stock: 3 },
      ],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: JSON.stringify(p.images),
        specs: p.specs ? JSON.stringify(p.specs) : null,
        featured: p.featured,
        published: p.published,
        categoryId: p.categoryId,
        brandId: p.brandId,
        variants: { create: p.variants },
      },
    });
  }

  console.log("Seed completado: marcas, categorías, productos y usuarios listos.");
  console.log("Admin: admin@astroskate.mx / admin123!");
  console.log("Cliente: cliente@demo.mx / cliente123!");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
