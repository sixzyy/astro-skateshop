import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { CONCAVE, DECK_LEN, DECK_THICK, KICK_H, KICK_START, TAPER, WAIST } from "./config";

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

function disposeGeometry(geo: THREE.BufferGeometry | null) {
  geo?.dispose();
}

export function useDisplacedGeometry(width: number, yOffset = 0) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, DECK_LEN, 48, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const hw = halfWidthAt(z, width / 2);
      const xn = (pos.getX(i) / (width / 2)) * hw;
      pos.setX(i, xn);
      pos.setY(i, surfaceY(xn, z, width) + yOffset);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [width, yOffset]);

  useEffect(() => () => disposeGeometry(geo), [geo]);
  return geo;
}

export function useSkirtGeometry(width: number) {
  const geo = useMemo(() => {
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

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [width]);

  useEffect(() => () => disposeGeometry(geo), [geo]);
  return geo;
}