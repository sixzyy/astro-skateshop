"use client";

import { useEffect, useRef } from "react";

/**
 * Clean four-point star cursor. Desktop only. Subtle motion.
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
    let isHover = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function tick() {
      pos.x = lerp(pos.x, target.x, 0.15);
      pos.y = lerp(pos.y, target.y, 0.15);
      const scale = isHover ? 1.4 : 1;
      const rotation = isHover ? 45 : 0;
      if (svg) svg.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)`;
      raf = requestAnimationFrame(tick);
    }

    const onMove = (e: MouseEvent) => { target.x = e.clientX; target.y = e.clientY; };
    const onEnter = () => { isHover = true; };
    const onLeave = () => { isHover = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    const observe = () => {
      document.querySelectorAll("a, button, [role='button'], input, select, textarea, label").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    observe();
    const observer = new MutationObserver(observe);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
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
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ willChange: "transform", marginLeft: "-8px", marginTop: "-8px" }}
    >
      <path
        d="M8 0 L9.2 6.5 L16 8 L9.2 9.5 L8 16 L6.8 9.5 L0 8 L6.8 6.5 Z"
        fill="var(--foreground)"
        opacity="0.7"
      />
    </svg>
  );
}
