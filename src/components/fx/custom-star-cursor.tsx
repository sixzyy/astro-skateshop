"use client";

import { useEffect, useRef } from "react";

/**
 * Celestial four-point star cursor v7. Desktop only.
 * Hover: scale(1.5) + rotate(45deg) + accent color. 350ms transition.
 */
export function CustomStarCursor() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const svg = svgRef.current;
    if (!svg) return;

    document.body.classList.add("cosmos-cursor");

    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function tick() {
      const smooth = 0.18;
      pos.x = lerp(pos.x, target.x, smooth);
      pos.y = lerp(pos.y, target.y, smooth);

      if (svg) svg.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      raf = requestAnimationFrame(tick);
    }

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const onEnterInteractive = () => {
      if (svg) {
        svg.style.transform += " scale(1.5) rotate(45deg)";
        svg.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
        svg.style.color = "var(--accent)";
      }
    };

    const onLeaveInteractive = () => {
      if (svg) {
        svg.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
        // Re-trigger tick to reset transform on next frame
      }
    };

    const onDown = () => {
      if (svg) {
        svg.style.transform += " scale(0.8)";
        svg.style.transition = "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)";
        setTimeout(() => {
          svg.style.transition = "";
        }, 150);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    raf = requestAnimationFrame(tick);

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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.body.classList.remove("cosmos-cursor");
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[101]"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{
        willChange: "transform",
        marginLeft: "-10px",
        marginTop: "-10px",
        color: "var(--foreground)",
      }}
    >
      {/* Four-point star — celestial shape */}
      <path
        d="M10 0 L11.5 7.5 L20 10 L11.5 12.5 L10 20 L8.5 12.5 L0 10 L8.5 7.5 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
