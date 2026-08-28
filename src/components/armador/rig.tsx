"use client";

import { memo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { DECK_LEN, type BoardConfig, type PartKey } from "./config";
import { Deck } from "./deck";
import { GripLayer } from "./grip";
import { Truck } from "./truck";
import { Wheel } from "./wheel";

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

const dampTo = (obj: THREE.Object3D, axis: "x" | "y" | "z", target: number, dt: number) => {
  obj.position[axis] = THREE.MathUtils.damp(obj.position[axis], target, 5, dt);
};

const PART_COLORS: Record<PartKey, string> = {
  decks: "#6fc8e9",
  trucks: "#e8a94c",
  wheels: "#46d4bf",
  grips: "#e8e4d8",
};

function PartLabel({
  label,
  color,
  position,
}: {
  label: string;
  color: string;
  position?: [number, number, number];
}) {
  return (
    <Html position={position} center distanceFactor={3} className="pointer-events-none select-none">
      <div
        style={{
          borderColor: color,
          background: "rgba(11,20,36,0.85)",
          color,
        }}
        className="whitespace-nowrap rounded-sm border px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider backdrop-blur"
      >
        {label}
      </div>
    </Html>
  );
}

export const Rig = memo(function Rig({
  config,
  onSelectPart,
}: {
  config: BoardConfig;
  onSelectPart?: (part: PartKey) => void;
}) {
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
  const [hovered, setHovered] = useState<PartKey | null>(null);
  useCursor(hovered !== null);

  const hover = (part: PartKey) => ({ onHover: () => setHovered(part) });
  const leave = { onLeave: () => setHovered(null) };
  const select = (part: PartKey) => ({ onSelect: () => onSelectPart?.(part) });

  useFrame((_, dt) => {
    const r = refs.current;
    const ex = config.exploded;
    const d = Math.min(dt, 0.05);
    if (r.deck) dampTo(r.deck, "y", ex ? 0.5 : 0, d);
    if (r.grip) dampTo(r.grip, "y", ex ? 0.68 : 0, d);
    if (r.truckF) dampTo(r.truckF, "y", ex ? -0.28 : 0, d);
    if (r.truckB) dampTo(r.truckB, "y", ex ? -0.28 : 0, d);
    for (const key of ["wheelFL", "wheelFR", "wheelBL", "wheelBR"] as const) {
      const el = r[key];
      if (!el) continue;
      const baseX = el.userData.baseX as number;
      dampTo(el, "x", baseX + Math.sign(baseX) * (ex ? 0.42 : 0), d);
    }
  });

  const truckZ = DECK_LEN * 0.29;
  const wheelBaseX = Math.min(
    config.axleLen / 2 - config.wheelRadius,
    config.deckWidth / 2 - config.wheelRadius * 0.75
  );

  return (
    <group ref={groupRef} position={[0, 0.31, 0]} rotation={[0, 0.6, 0]}>
      <group
        ref={(el) => {
          refs.current.deck = el;
        }}
      >
        <Deck
          width={config.deckWidth}
          imageUrl={config.deckImage}
          showGraphic={config.showGraphic}
          hovered={hovered === "decks"}
          {...hover("decks")}
          {...leave}
          {...select("decks")}
        />
{config.exploded && config.labels.find((l) => l.key === "decks") && (
            <PartLabel label="Tabla" color={PART_COLORS.decks} position={[0, 0.32, 0]} />
          )}
        </group>

      {config.hasGrip && (
        <group
          ref={(el) => {
            refs.current.grip = el;
          }}
        >
          <GripLayer
            width={config.deckWidth}
            hovered={hovered === "grips"}
            {...hover("grips")}
            {...leave}
            {...select("grips")}
          />
{config.exploded && config.labels.find((l) => l.key === "grips") && (
            <PartLabel label="Grip" color={PART_COLORS.grips} position={[0, 0.2, 0]} />
          )}
        </group>
      )}

      {[truckZ, -truckZ].map((z, ti) => {
        const key = ti === 0 ? "truckF" : "truckB";
        return (
          <group key={key} position={[0, -0.03, z]}>
            <group
              ref={(el) => {
                refs.current[key] = el;
              }}
            >
              <Truck
                axleLen={config.axleLen}
                hovered={hovered === "trucks"}
                {...hover("trucks")}
                {...leave}
                {...select("trucks")}
              />
{config.exploded && ti === 0 && config.labels.find((l) => l.key === "trucks") && (
              <PartLabel label="Trucks" color={PART_COLORS.trucks} position={[0, -0.1, 0]} />
            )}
            </group>
            {([1, -1] as const).map((side) => {
              const wKey = (ti === 0 ? (side === 1 ? "wheelFR" : "wheelFL") : side === 1 ? "wheelBR" : "wheelBL") as keyof PartRefs;
              const baseX = side * wheelBaseX;
              return (
                <group
                  key={wKey}
                  position={[baseX, -0.148, 0]}
                  ref={(el) => {
                    if (!el) return;
                    refs.current[wKey] = el;
                    el.userData.baseX = baseX;
                  }}
                >
                  <Wheel
                    radius={config.wheelRadius}
                    width={config.wheelRadius * 1.15}
                    color={config.wheelColor}
                    hovered={hovered === "wheels"}
                    {...hover("wheels")}
                    {...leave}
                    {...select("wheels")}
                  />
                  {config.exploded && ti === 0 && side === 1 && config.labels.find((l) => l.key === "wheels") && (
                    <PartLabel label="Ruedas" color={PART_COLORS.wheels} />
                  )}
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
});