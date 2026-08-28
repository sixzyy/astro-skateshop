"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDisplacedGeometry } from "./geometry";

interface PartEvents {
  hovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const GripLayer = memo(function GripLayer({
  width,
  color = "#17171b",
  hovered,
  onHover,
  onLeave,
  onSelect,
}: {
  width: number;
  color?: string;
} & PartEvents) {
  const geo = useDisplacedGeometry(width, 0.012);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const g = 30 + Math.random() * 60;
      ctx.fillStyle = `rgb(${g},${g},${g + 6})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 24);
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }
    return () => tex.dispose();
  }, [color]);

  const emissive = useMemo(
    () => (hovered ? new THREE.Color("#6fc8e9") : new THREE.Color("#000000")),
    [hovered]
  );

  return (
    <mesh
      geometry={geo}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onPointerOut={onLeave}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <meshStandardMaterial
        ref={matRef}
        color={color}
        roughness={0.98}
        emissive={emissive}
        emissiveIntensity={hovered ? 0.35 : 0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
});