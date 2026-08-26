"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds .is-visible to elements with .reveal-section or .reveal-image
 * when they enter the viewport. Uses IntersectionObserver for performance.
 * Re-scans on route changes.
 */
export function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    observerRef.current = observer;

    // Small delay to let DOM render after route change
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        ".reveal-section:not(.is-visible), .reveal-image:not(.is-visible)"
      );
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);
}
