"use client";

import { useEffect, useRef } from "react";

/**
 * Adds .is-visible to elements with .reveal-section or .reveal-image
 * when they enter the viewport. Uses IntersectionObserver for performance.
 */
export function useScrollReveal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    initialized.current = true;

    const elements = document.querySelectorAll(".reveal-section, .reveal-image");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
