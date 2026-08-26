"use client";

import { useEffect, useRef } from "react";

/**
 * Four-point star cursor with scale/rotate on hover. Desktop only.
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
      const scale = isHover ? 1.5 : 1;
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{ willChange: "transform", marginLeft: "-12px", marginTop: "-12px" }}
    >
      <path
        d="M12 0 L13.8 9.8 L24 12 L13.8 14.2 L12 24 L10.2 14.2 L0 12 L10.2 9.8 Z"
        fill="#54d8ff"
        opacity="0.8"
      />
    </svg>
  );
}
