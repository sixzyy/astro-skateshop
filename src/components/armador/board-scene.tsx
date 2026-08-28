"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  Stars,
} from "@react-three/drei";
import type { BoardConfig, PartKey } from "./config";
import { Rig } from "./rig";

function CameraReset({ resetKey }: { resetKey: number }) {
  const controls = useThree((s) => s.controls) as { reset?: () => void } | null;
  useEffect(() => {
    if (resetKey > 0) controls?.reset?.();
  }, [resetKey, controls]);
  return null;
}

export function BoardScene({
  config,
  onSelectPart,
}: {
  config: BoardConfig;
  onSelectPart?: (part: PartKey) => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [2.5, 1.5, 3.1], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#6fc8e9" />

      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 4, -6]}
          scale={[8, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-6, 2, 2]}
          scale={[2, 6, 1]}
          rotation-y={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[6, 2, -1]}
          scale={[2, 5, 1]}
          rotation-y={-Math.PI / 2}
        />
        <Lightformer form="ring" intensity={1} position={[0, -3, 4]} scale={[4, 4, 1]} />
      </Environment>

      <Rig config={config} onSelectPart={onSelectPart} />

      <ContactShadows
        position={[0, -0.005, 0]}
        opacity={0.42}
        scale={9}
        blur={2.4}
        far={2.5}
        color="#000000"
      />
      <Stars radius={42} depth={28} count={1600} factor={3} saturation={0.4} fade speed={0.5} />

      <OrbitControls
        enablePan={false}
        minDistance={2.1}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={config.autoRotate}
        autoRotateSpeed={0.7}
        makeDefault
      />
      <CameraReset resetKey={config.resetKey} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}