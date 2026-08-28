import { prisma } from "@/lib/prisma";

export const SETTING_DEFAULTS = {
  freeShippingThreshold: "999",
  shippingFlat: "149",
  announcement: "",
  whatsappNumber: "573001234567",
  instagramUrl: "https://instagram.com/astroskateshop",
  tiktokUrl: "https://tiktok.com/@astroskateshop",
  youtubeUrl: "https://youtube.com/@astroskateshop",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

const PUBLIC_KEYS: SettingKey[] = [
  "freeShippingThreshold",
  "shippingFlat",
  "announcement",
  "whatsappNumber",
  "instagramUrl",
  "tiktokUrl",
  "youtubeUrl",
];

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany();
  const map = { ...SETTING_DEFAULTS } as Record<SettingKey, string>;
  for (const row of rows) {
    if (row.key in map) map[row.key as SettingKey] = row.value;
  }
  return map;
}

export async function getPublicSettings(): Promise<Record<SettingKey, string>> {
  const all = await getSettings();
  const out = {} as Record<SettingKey, string>;
  for (const key of PUBLIC_KEYS) out[key] = all[key];
  return out;
}

export async function saveSettings(patch: Record<string, string>) {
  const entries = Object.entries(patch).filter(([key]) => key in SETTING_DEFAULTS);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
}
