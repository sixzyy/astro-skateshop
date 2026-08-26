"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = "Astro Skate";
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const sizeMap = {
    sm: { star: 14, text: "text-sm", gap: "gap-1" },
    md: { star: 18, text: "text-lg", gap: "gap-1.5" },
    lg: { star: 24, text: "text-2xl", gap: "gap-2" },
  };

  const s = sizeMap[size];

  return (
    <Link href="/" className={`flex items-center ${s.gap}`}>
      {/* Four-point star */}
      <svg
        viewBox="0 0 24 24"
        width={s.star}
        height={s.star}
        fill="none"
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:rotate-90"
      >
        <path
          d="M12 0 L13.8 9.8 L24 12 L13.8 14.2 L12 24 L10.2 14.2 L0 12 L10.2 9.8 Z"
          fill="#54d8ff"
          opacity="0.8"
        />
      </svg>

      {/* Text — char-by-char entrance */}
      <span className={`font-display font-bold uppercase tracking-tight ${s.text}`}>
        {text.split("").map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="inline-block"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(6px)",
              transition: `opacity 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </Link>
  );
}
