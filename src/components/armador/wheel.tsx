"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";

interface PartEvents {
  hovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const URETHANE = ["#6fc8e9", "#46d4bf", "#e8e4d8", "#9a8fe8"];

export function wheelColorForId(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return URETHANE[sum % URETHANE.length];
}

function wheelProfile(radius: number, width: number) {
  const R = radius;
  const W = width / 2;
  return [
    new THREE.Vector2(0.3 * R, -W),
    new THREE.Vector2(0.9 * R, -W),
    new THREE.Vector2(R * 0.97, -W + 0.04 * W),
    new THREE.Vector2(R, -W + 0.08 * W),
    new THREE.Vector2(R, W - 0.08 * W),
    new THREE.Vector2(R * 0.97, W - 0.04 * W),
    new THREE.Vector2(0.9 * R, W),
    new THREE.Vector2(0.3 * R, W),
  ];
}

export const Wheel = memo(function Wheel({
  radius,
  width,
  color,
  hovered,
  onHover,
  onLeave,
  onSelect,
}: {
  radius: number;
  width: number;
  color: string;
} & PartEvents) {
  const profile = useMemo(() => wheelProfile(radius, width), [radius, width]);
  const geometry = useMemo(() => {
    const g = new THREE.LatheGeometry(profile, 32);
    return g;
  }, [profile]);

  const emissive = useMemo(
    () => (hovered ? new THREE.Color("#ffffff") : new THREE.Color("#000000")),
    [hovered]
  );

  return (
    <group
      castShadow
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
      <mesh geometry={geometry} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshPhysicalMaterial
          color={color}
          roughness={0.32}
          metalness={0.02}
          clearcoat={0.6}
          clearcoatRoughness={0.4}
          emissive={emissive}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, width + 0.012, 16]} />
        <meshStandardMaterial color="#3a3d44" roughness={0.35} metalness={0.85} />
      </mesh>
    </group>
  );
});