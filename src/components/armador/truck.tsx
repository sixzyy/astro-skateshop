"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";

interface PartEvents {
  hovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const Truck = memo(function Truck({
  axleLen,
  hovered,
  onHover,
  onLeave,
  onSelect,
}: {
  axleLen: number;
} & PartEvents) {
  const emissive = useMemo(
    () => (hovered ? new THREE.Color("#6fc8e9") : new THREE.Color("#000000")),
    [hovered]
  );
  const emissiveIntensity = hovered ? 0.25 : 0;
  const silver = (
    <meshStandardMaterial
      color="#b8bcc4"
      roughness={0.25}
      metalness={0.95}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );

  return (
    <group>
      {/* hanger body */}
      <mesh
        position={[0, -0.018, 0]}
        rotation={[0, 0, -0.04]}
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
        <boxGeometry args={[0.18, 0.032, 0.34]} />
        {silver}
      </mesh>

      {/* baseplate */}
      <mesh
        position={[0, -0.052, -0.01]}
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
        <boxGeometry args={[0.24, 0.018, 0.36]} />
        <meshStandardMaterial color="#9aa0aa" roughness={0.3} metalness={0.95} />
      </mesh>

      {/* kingpin */}
      <mesh position={[0, -0.052, 0.035]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 10]} />
        <meshStandardMaterial color="#8a8f98" roughness={0.35} metalness={0.95} />
      </mesh>

      {/* bushings */}
      <mesh position={[0, -0.082, 0.045]}>
        <cylinderGeometry args={[0.03, 0.018, 0.045, 14]} />
        <meshStandardMaterial color="#e8a94c" roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.062, 0.047]}>
        <cylinderGeometry args={[0.018, 0.022, 0.024, 14]} />
        <meshStandardMaterial color="#e8a94c" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* axle */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.148, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, axleLen, 8]} />
        <meshStandardMaterial color="#8a8f98" roughness={0.3} metalness={0.95} />
      </mesh>

      {/* axle hanger detail */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.148, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.03, 8]} />
        {silver}
      </mesh>
    </group>
  );
});