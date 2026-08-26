function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ["#cfe9ff", "#ffffff", "#ffd9a8"];

export function Starfield({ density = 90 }: { density?: number }) {
  const rand = mulberry32(20260817);
  const stars = Array.from({ length: density }, (_, i) => {
    const layer = i % 3;
    const base = [0.9, 1.4, 2][layer];
    return {
      x: rand() * 100,
      y: rand() * 100,
      r: base * (0.7 + rand() * 0.6),
      c: COLORS[layer],
      dur: 2.5 + rand() * 3,
      delay: rand() * 4,
    };
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.r}px`,
            height: `${s.r}px`,
            backgroundColor: s.c,
            boxShadow: `0 0 ${s.r * 3}px ${s.c}`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
