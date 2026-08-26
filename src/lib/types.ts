export interface VariantDTO {
  id: string;
  title: string;
  stock: number;
  sku: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  specs: Record<string, string> | null;
  featured: boolean;
  published: boolean;
  category: CategoryDTO;
  brand: BrandDTO;
  variants: VariantDTO[];
}

export type Role = "CLIENT" | "ADMIN";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type CouponType = "PERCENT" | "FIXED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) ? arr.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseSpecs(value: unknown): Record<string, string> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, string>;
  if (typeof value === "string") {
    try {
      const obj = JSON.parse(value);
      return obj && typeof obj === "object" && !Array.isArray(obj) ? (obj as Record<string, string>) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function withImages<T extends { images?: unknown; specs?: unknown }>(
  row: T,
): Omit<T, "images" | "specs"> & { images: string[]; specs: Record<string, string> | null } {
  const { images, specs, ...rest } = row;
  return { ...(rest as Omit<T, "images" | "specs">), images: parseImages(images), specs: parseSpecs(specs) };
}

export function withImagesAll<T extends { images?: unknown }>(rows: T[]) {
  return rows.map(withImages);
}
