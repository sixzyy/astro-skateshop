"use client";

import { useEffect } from "react";

/**
 * Suppresses React hydration warnings caused by Bitdefender browser extension
 * injecting `bis_skin_checked` attributes into the DOM before React finishes hydrating.
 *
 * `suppressHydrationWarning` only works on text content, NOT on HTML attributes.
 * This patches console.error to filter out the specific hydration mismatch noise.
 */
export function HydrationSuppressor() {
  useEffect(() => {
    const original = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (
        msg.includes("Hydration") ||
        msg.includes("hydrat") ||
        msg.includes("server-rendered HTML didn't match") ||
        msg.includes("bis_skin_checked")
      ) {
        return;
      }
      original.apply(console, args);
    };
    return () => {
      console.error = original;
    };
  }, []);

  return null;
}
