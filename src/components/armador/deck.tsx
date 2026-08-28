"use client";

import { memo, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { DECK_LEN, DECK_THICK } from "./config";
import { useDisplacedGeometry, useSkirtGeometry } from "./geometry";

function useDeckTexture(imageUrl: string | null, width: number) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(imageUrl, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      loaded = tex;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(Math.min(1, width / DECK_LEN), 1);
      tex.offset.x = (1 - tex.repeat.x) / 2;
      tex.anisotropy = 8;
      setTexture(tex);
    });
    return () => {
      cancelled = true;
      if (loaded) loaded.dispose();
    };
  }, [imageUrl, width]);

  // Sin imagen el resultado siempre es null (ignora texturas previas descargadas).
  return imageUrl ? texture : null;
}

interface PartEvents {
  hovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const Deck = memo(function Deck({
  width,
  imageUrl,
  showGraphic,
  hovered,
  onHover,
  onLeave,
  onSelect,
}: {
  width: number;
  imageUrl: string | null;
  showGraphic: boolean;
} & PartEvents) {
  const topGeo = useDisplacedGeometry(width, 0);
  const bottomGeo = useDisplacedGeometry(width, -DECK_THICK);
  const skirtGeo = useSkirtGeometry(width);
  const texture = useDeckTexture(showGraphic ? imageUrl : null, width);

  const emissive = useMemo(
    () => (hovered ? new THREE.Color("#6fc8e9") : new THREE.Color("#000000")),
    [hovered]
  );

  return (
    <group
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
      <mesh geometry={topGeo} receiveShadow castShadow>
        {texture ? (
          <meshStandardMaterial
            map={texture}
            color="#ffffff"
            roughness={0.5}
            metalness={0.08}
            emissive={emissive}
            emissiveIntensity={hovered ? 0.22 : 0}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial
            color="#191512"
            roughness={0.95}
            metalness={0}
            emissive={emissive}
            emissiveIntensity={hovered ? 0.22 : 0}
            side={THREE.FrontSide}
          />
        )}
      </mesh>
      <mesh geometry={skirtGeo}>
        <meshStandardMaterial color="#c9a06a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={bottomGeo}>
        <meshStandardMaterial
          color={texture ? "#ffffff" : "#191512"}
          map={texture ?? undefined}
          roughness={0.55}
          metalness={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
});