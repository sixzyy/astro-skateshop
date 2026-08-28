"use client";

import { useEffect, useState } from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/utils";

export interface StoreSettings {
  freeShippingThreshold: number;
  shippingFlat: number;
  announcement: string;
  whatsappNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

const DEFAULTS: StoreSettings = {
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  shippingFlat: SHIPPING_FLAT,
  announcement: "",
  whatsappNumber: "573001234567",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
};

// Module-level cache so multiple components share one request.
let cache: Promise<StoreSettings> | null = null;

function load(): Promise<StoreSettings> {
  if (!cache) {
    cache = fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => ({
        freeShippingThreshold:
          Number(json.settings?.freeShippingThreshold) || FREE_SHIPPING_THRESHOLD,
        shippingFlat: Number(json.settings?.shippingFlat) || SHIPPING_FLAT,
        announcement: json.settings?.announcement ?? "",
        whatsappNumber: json.settings?.whatsappNumber ?? DEFAULTS.whatsappNumber,
        instagramUrl: json.settings?.instagramUrl ?? "",
        tiktokUrl: json.settings?.tiktokUrl ?? "",
        youtubeUrl: json.settings?.youtubeUrl ?? "",
      }))
      .catch(() => DEFAULTS);
  }
  return cache;
}

export function useSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setSettings(s));
    return () => {
      alive = false;
    };
  }, []);
  return settings;
}
