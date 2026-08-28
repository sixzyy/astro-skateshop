"use client";

import { useEffect, useRef } from "react";

export function CustomStarCursor() {
  const starRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const last = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const star = starRef.current;
    const trail = trailRef.current;
    if (!star || !trail) return;

    document.body.classList.add("cosmos-cursor");
    let frame = 0;
    let mx = 0;
    let my = 0;

    const spawnSpark = (x: number, y: number) => {
      if (trail.childElementCount > 36) return;
      const spark = document.createElement("span");
      const dx = (Math.random() - 0.5) * 30;
      const dy = (Math.random() - 0.5) * 30;
      spark.className = "cursor-spark";
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty("--dx", `${dx}px`);
      spark.style.setProperty("--dy", `${dy}px`);
      trail.appendChild(spark);
      window.setTimeout(() => spark.remove(), 700);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      star.style.opacity = "1";
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          star.style.transform = `translate(${mx - 11}px, ${my - 11}px)`;
        });
      }
      const dist = Math.hypot(mx - last.current.x, my - last.current.y);
      if (dist > 32) {
        last.current = { x: mx, y: my };
        spawnSpark(mx, my);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("cosmos-cursor");
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" />
      <div
        ref={starRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-[22px] w-[22px] opacity-0 mix-blend-screen"
        style={{ filter: "drop-shadow(0 0 7px rgba(0, 240, 255, 0.95))" }}
      >
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path
            d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z"
            fill="#00f0ff"
          />
        </svg>
      </div>
    </>
  );
}
