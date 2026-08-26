"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Reticle cursor — dot + crosshair. Desktop only. No particles.
 */
export function CustomStarCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent) => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    ring.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px)`;
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
      ring.style.width = "44px";
      ring.style.height = "44px";
      ring.style.borderColor = "var(--accent)";
      ring.style.opacity = "0.6";
    };

    const onLeaveInteractive = () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "var(--foreground)";
      ring.style.opacity = "0.25";
    };

    window.addEventListener("mousemove", handler, { passive: true });

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
      {/* Reticle ring — square crosshair */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-9 w-9 rounded-sm border transition-[width,height,border-color,opacity] duration-200 ease-out"
        style={{ borderColor: "var(--foreground)", opacity: 0.25, willChange: "transform" }}
      >
        {/* Top tick */}
        <div className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-current opacity-50" />
        {/* Bottom tick */}
        <div className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-current opacity-50" />
        {/* Left tick */}
        <div className="absolute left-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-current opacity-50" />
        {/* Right tick */}
        <div className="absolute right-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-current opacity-50" />
      </div>
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
