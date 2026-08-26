"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Stars } from "@react-three/drei";

const DECK_LEN = 3.2;
const KICK_START = 0.95;
const KICK_H = 0.34;
const CONCAVE = 0.05;
const DECK_THICK = 0.036;
const TAPER = 0.5;
const WAIST = 0.045;

function deckCurve(z: number) {
  const hl = DECK_LEN / 2;
  const az = Math.abs(z);
  const s = Math.max(0, (az - KICK_START) / (hl - KICK_START));
  const smooth = s * s * (3 - 2 * s);
  return KICK_H * smooth;
}

function halfWidthAt(z: number, hwMax: number) {
  const hl = DECK_LEN / 2;
  const az = Math.abs(z);
  const t = Math.min(1, Math.max(0, (az - (hl - TAPER)) / TAPER));
  const round = Math.sqrt(Math.max(0, 1 - t * t));
  const u = z / hl;
  const waist = 1 - WAIST * Math.pow(1 - u * u, 2);
  return Math.max(hwMax * 0.02, hwMax * round * waist);
}

function surfaceY(x: number, z: number, width: number) {
  return deckCurve(z) - CONCAVE * Math.pow(Math.min(1, Math.abs(x) / (width / 2)), 2);
}

const URETHANE = ["#00f0ff", "#ff6b00", "#e8e4d8", "#c26bff"];

function colorForId(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return URETHANE[sum % URETHANE.length];
}

export function wheelColorForId(id: string) {
  return colorForId(id);
}

function useDisplacedGeometry(width: number, yOffset = 0) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, DECK_LEN, 48, 120);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const hw = halfWidthAt(z, width / 2);
      const xn = (pos.getX(i) / (width / 2)) * hw;
      pos.setX(i, xn);
      pos.setY(i, surfaceY(xn, z, width) + yOffset);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, yOffset]);
}

function useSkirtGeometry(width: number) {
  return useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const bot: THREE.Vector3[] = [];
    const STEPS = 90;
    const hw = width / 2;
    const hl = DECK_LEN / 2;

    for (let i = 0; i <= STEPS; i++) {
      const z = -hl + (i / STEPS) * DECK_LEN;
      const w = halfWidthAt(z, hw);
      pts.push(new THREE.Vector3(w, surfaceY(w, z, width), z));
      bot.push(new THREE.Vector3(w, surfaceY(w, z, width) - DECK_THICK, z));
    }
    for (let i = STEPS; i >= 0; i--) {
      const z = -hl + (i / STEPS) * DECK_LEN;
      const w = halfWidthAt(z, hw);
      pts.push(new THREE.Vector3(-w, surfaceY(-w, z, width), z));
      bot.push(new THREE.Vector3(-w, surfaceY(-w, z, width) - DECK_THICK, z));
    }

    const count = pts.length;
    const positions = new Float32Array(count * 2 * 3);
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.set([pts[i].x, pts[i].y, pts[i].z], i * 6);
      positions.set([bot[i].x, bot[i].y, bot[i].z], i * 6 + 3);
    }
    for (let i = 0; i < count; i++) {
      const n = (i + 1) % count;
      const a = i * 2;
      indices.push(a, a + 1, n * 2, n * 2, a + 1, n * 2 + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [width]);
}

function Deck({
  width,
  imageUrl,
}: {
  width: number;
  imageUrl: string | null;
}) {
  const topGeo = useDisplacedGeometry(width, 0);
  const bottomGeo = useDisplacedGeometry(width, -DECK_THICK);
  const skirtGeo = useSkirtGeometry(width);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(imageUrl, (tex) => {
      if (cancelled) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(Math.min(1, width / DECK_LEN), 1);
      tex.offset.x = (1 - tex.repeat.x) / 2;
      tex.anisotropy = 4;
      setTexture(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, width]);

  return (
    <group>
      <mesh geometry={topGeo} receiveShadow>
        <meshStandardMaterial color="#191512" roughness={0.95} metalness={0} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={skirtGeo}>
        <meshStandardMaterial color="#c9a06a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={bottomGeo}>
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? "#ffffff" : "#2a085c"}
          roughness={0.55}
          metalness={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function Truck({ axleLen }: { axleLen: number }) {
  const silver = (
    <meshStandardMaterial color="#b8bcc4" roughness={0.32} metalness={0.9} />
  );
  return (
    <group>
      <mesh position={[0, -0.018, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.34]} />
        {silver}
      </mesh>
      <mesh position={[0, -0.07, 0.05]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 10]} />
        <meshStandardMaterial color="#8a8f98" roughness={0.35} metalness={0.95} />
      </mesh>
      <mesh position={[0, -0.105, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.055, 14]} />
        <meshStandardMaterial color="#d4a24e" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.145, 0]}>
        <cylinderGeometry args={[0.03, 0.03, axleLen * 0.62, 12]} />
        {silver}
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.145, 0]}>
        <cylinderGeometry args={[0.011, 0.011, axleLen, 8]} />
        <meshStandardMaterial color="#8a8f98" roughness={0.3} metalness={0.95} />
      </mesh>
    </group>
  );
}

function Wheel({ radius, width, color }: { radius: number; width: number; color: string }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, width, 24]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, width + 0.012, 16]} />
        <meshStandardMaterial color="#3a3d44" roughness={0.35} metalness={0.85} />
      </mesh>
    </group>
  );
}

interface PartRefs {
  deck: THREE.Group | null;
  grip: THREE.Group | null;
  truckF: THREE.Group | null;
  truckB: THREE.Group | null;
  wheelFL: THREE.Group | null;
  wheelFR: THREE.Group | null;
  wheelBL: THREE.Group | null;
  wheelBR: THREE.Group | null;
}

export interface BoardConfig {
  deckWidth: number;
  deckImage: string | null;
  axleLen: number;
  wheelRadius: number;
  wheelColor: string;
  hasGrip: boolean;
  exploded: boolean;
  autoRotate: boolean;
}

const dampTo = (obj: THREE.Object3D, axis: "x" | "y" | "z", target: number, dt: number) => {
  obj.position[axis] = THREE.MathUtils.damp(obj.position[axis], target, 5, dt);
};

function Rig({ config }: { config: BoardConfig }) {
  const refs = useRef<PartRefs>({
    deck: null,
    grip: null,
    truckF: null,
    truckB: null,
    wheelFL: null,
    wheelFR: null,
    wheelBL: null,
    wheelBR: null,
  });
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const r = refs.current;
    const ex = config.exploded;
    if (r.deck) dampTo(r.deck, "y", ex ? 0.5 : 0, dt);
    if (r.grip) dampTo(r.grip, "y", ex ? 0.68 : 0, dt);
    if (r.truckF) dampTo(r.truckF, "y", ex ? -0.3 : 0, dt);
    if (r.truckB) dampTo(r.truckB, "y", ex ? -0.3 : 0, dt);
    for (const key of ["wheelFL", "wheelFR", "wheelBL", "wheelBR"] as const) {
      const el = r[key];
      if (!el) continue;
      const baseX = el.userData.baseX as number;
      dampTo(el, "x", baseX + Math.sign(baseX) * (ex ? 0.36 : 0), dt);
    }
  });

  const truckZ = DECK_LEN * 0.29;
  const wheelY = -DECK_THICK - 0.11;

  return (
    <group ref={groupRef} position={[0, 0.31, 0]} rotation={[0, 0.6, 0]}>
      <group ref={(el) => { refs.current.deck = el; }}>
        <Deck width={config.deckWidth} imageUrl={config.deckImage} />
      </group>

      {config.hasGrip && (
        <group ref={(el) => { refs.current.grip = el; }}>
          <GripLayer width={config.deckWidth} />
        </group>
      )}

      {[truckZ, -truckZ].map((z, ti) => {
        const key = ti === 0 ? "truckF" : "truckB";
        return (
          <group key={key} position={[0, -0.03, z]}>
            <group ref={(el) => { refs.current[key] = el; }}>
              <Truck axleLen={config.axleLen} />
            </group>
            {[1, -1].map((side) => {
              const wKey = (
                ti === 0 ? (side === 1 ? "wheelFR" : "wheelFL") : side === 1 ? "wheelBR" : "wheelBL"
              ) as keyof PartRefs;
              const baseX = side * (config.axleLen / 2 - config.wheelRadius * 0.9);
              return (
                <group
                  key={wKey}
                  position={[baseX, wheelY, 0]}
                  ref={(el) => {
                    if (!el) return;
                    refs.current[wKey] = el;
                    el.userData.baseX = baseX;
                  }}
                >
                  <Wheel
                    radius={config.wheelRadius}
                    width={config.wheelRadius * 1.25}
                    color={config.wheelColor}
                  />
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function GripLayer({ width }: { width: number }) {
  const geo = useDisplacedGeometry(width, 0.012);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx || !matRef.current) return;
    ctx.fillStyle = "#101014";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const g = 30 + Math.random() * 60;
      ctx.fillStyle = `rgb(${g},${g},${g + 6})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 24);
    matRef.current.map = tex;
    matRef.current.needsUpdate = true;
  }, []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial ref={matRef} color="#111116" roughness={0.98} side={THREE.FrontSide} />
    </mesh>
  );
}

export function BoardScene({ config }: { config: BoardConfig }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [2.5, 1.5, 3.1], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.35} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#00f0ff" />
      <pointLight position={[0, -2, 2]} intensity={0.35} color="#ff6b00" />

      <Rig config={config} />

      <ContactShadows position={[0, -0.005, 0]} opacity={0.42} scale={9} blur={2.4} far={2.5} color="#000000" />
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
    </Canvas>
  );
}
