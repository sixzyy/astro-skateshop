"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Custom cursor — small dot + ring that expands on hover.
 * Desktop only. No particle trail. Clean and minimal.
 */
export function CustomStarCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent) => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    ring.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add("cosmos-cursor");
    let frame = 0;

    const handler = (e: MouseEvent) => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          onMove(e);
        });
      }
    };

    const onEnterInteractive = () => {
      ring.style.width = "40px";
      ring.style.height = "40px";
      ring.style.borderColor = "var(--accent)";
      ring.style.opacity = "0.5";
    };

    const onLeaveInteractive = () => {
      ring.style.width = "32px";
      ring.style.height = "32px";
      ring.style.borderColor = "var(--foreground)";
      ring.style.opacity = "0.2";
    };

    window.addEventListener("mousemove", handler, { passive: true });

    // Attach hover states to interactive elements
    const observeHover = () => {
      document.querySelectorAll("a, button, [role='button'], input, select, textarea, label").forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    };
    observeHover();
    const observer = new MutationObserver(observeHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handler);
      document.body.classList.remove("cosmos-cursor");
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [onMove]);

  return (
    <>
      {/* Ring — follows with slight lag via CSS transition */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-8 w-8 rounded-full border transition-[width,height,border-color,opacity] duration-200 ease-out"
        style={{ borderColor: "var(--foreground)", opacity: 0.2, willChange: "transform" }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[102] h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--foreground)", willChange: "transform" }}
      />
    </>
  );
}
