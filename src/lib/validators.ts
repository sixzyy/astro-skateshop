import { z } from "zod";
import { isDirectImageUrl } from "@/lib/utils";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const categoryInputSchema = z.object({
  name: z.string().min(2).max(60),
});

const variantInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "La variante necesita un título").max(60),
  sku: z.string().max(60).optional(),
  stock: z.coerce.number().int().min(0),
});

const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "Hay una URL de imagen vacía")
  .refine(
    isDirectImageUrl,
    "Pega el enlace directo a una imagen (.jpg, .png, .webp), no una página de búsqueda o un link raro"
  );

export const productInputSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  images: z.array(imageUrlSchema).min(1, "Agrega al menos una imagen"),
  specs: z.record(z.string(), z.string()).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  publishedAt: z.coerce.date().optional().nullable(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  brandId: z.string().min(1, "Selecciona una marca"),
  variants: z.array(variantInputSchema).min(1, "Agrega al menos una variante"),
});

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "El código necesita al menos 3 caracteres")
      .max(24)
      .regex(/^[A-Z0-9_-]+$/i, "Solo letras, números y guiones (sin espacios)")
      .transform((v) => v.toUpperCase()),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive("El valor debe ser mayor a 0"),
    minSubtotal: z.coerce.number().min(0).default(0),
    startsAt: z.coerce.date().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    active: z.boolean().default(true),
  })
  .refine((c) => c.type !== "PERCENT" || c.value <= 90, {
    message: "El porcentaje no puede ser mayor a 90%",
    path: ["value"],
  });

export const reviewInputSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2, "Tu nombre necesita al menos 2 caracteres").max(60),
  rating: z.coerce.number().int().min(1, "Selecciona de 1 a 5 estrellas").max(5),
  comment: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(1000),
});

export const stockAlertInputSchema = z.object({
  variantId: z.string().min(1),
  email: z.email("Correo electrónico inválido"),
});

export const settingsInputSchema = z.record(z.string(), z.string().max(500));

export const checkoutItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const checkoutSchema = z
  .object({
    items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
    couponCode: z.string().trim().max(24).optional(),
    addressId: z.string().trim().optional(),
    saveAddress: z.boolean().optional(),
    shippingInfo: z
      .object({
        name: z.string().min(2).max(120),
        email: z.email("Correo electrónico inválido"),
        address: z.string().min(5).max(200),
        city: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        postalCode: z.string().min(3).max(12),
      })
      .optional(),
  })
  .refine((d) => Boolean(d.addressId || d.shippingInfo), {
    message: "Falta la dirección de envío",
    path: ["shippingInfo"],
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(30).default("Dirección"),
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(12),
  phone: z.string().trim().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Za-z]/, "Debe incluir letras")
    .regex(/\d/, "Debe incluir un número"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CouponInput = z.infer<typeof couponInputSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
