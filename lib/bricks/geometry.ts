import * as THREE from "three";
import type { BrickPart } from "./catalog";
import { STUD_RADIUS } from "./units";

export const TRAPEZOID_INSET = 0.2;
const MESH_INSET = 0.98;

export type StudPoint = { x: number; z: number };

export function createPartGeometry(part: BrickPart): THREE.BufferGeometry {
  const w = part.footprint.w;
  const d = part.footprint.d;
  const height = part.height;
  const radius = 0.48 * Math.min(w, d);

  switch (part.shape) {
    case "cylinder":
      return new THREE.CylinderGeometry(radius, radius, height, 24);
    case "cone":
      return new THREE.CylinderGeometry(0, radius, height, 24);
    case "sphere":
      return new THREE.SphereGeometry(height / 2, 24, 16);
    case "trapezoid":
      return createExtrudedProfile(
        trapezoidProfile(w, height),
        d * MESH_INSET,
      );
    case "wedge":
      return createExtrudedProfile(wedgeProfile(w, height), d * MESH_INSET);
    case "pyramid":
      return createPyramidGeometry(w, d, height);
    case "box":
    default:
      return new THREE.BoxGeometry(w * MESH_INSET, height, d * MESH_INSET);
  }
}

export function studLayout(part: BrickPart): StudPoint[] {
  if (!part.topStuds) return [];
  const w = part.footprint.w;
  const d = part.footprint.d;
  const list: StudPoint[] = [];
  const topHalfW =
    part.shape === "trapezoid" ? (w - 2 * TRAPEZOID_INSET) / 2 : w / 2;
  const topHalfD = d / 2;

  for (let ix = 0; ix < w; ix++) {
    for (let iz = 0; iz < d; iz++) {
      const x = -w / 2 + 0.5 + ix;
      const z = -d / 2 + 0.5 + iz;
      if (part.shape === "trapezoid") {
        if (
          Math.abs(x) + STUD_RADIUS > topHalfW + 1e-6 ||
          Math.abs(z) + STUD_RADIUS > topHalfD + 1e-6
        ) {
          continue;
        }
      }
      list.push({ x, z });
    }
  }
  return list;
}

function trapezoidProfile(w: number, height: number): THREE.Shape {
  const hw = (w * MESH_INSET) / 2;
  const hh = height / 2;
  const topHw = Math.max(0.08, ((w - 2 * TRAPEZOID_INSET) * MESH_INSET) / 2);
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(topHw, hh);
  shape.lineTo(-topHw, hh);
  shape.closePath();
  return shape;
}

function wedgeProfile(w: number, height: number): THREE.Shape {
  const hw = (w * MESH_INSET) / 2;
  const hh = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.closePath();
  return shape;
}

function createExtrudedProfile(
  shape: THREE.Shape,
  depth: number,
): THREE.BufferGeometry {
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  geom.translate(0, 0, -depth / 2);
  geom.computeVertexNormals();
  return geom;
}

function createPyramidGeometry(
  w: number,
  d: number,
  height: number,
): THREE.BufferGeometry {
  const hw = (w * MESH_INSET) / 2;
  const hd = (d * MESH_INSET) / 2;
  const hh = height / 2;
  const apex = new THREE.Vector3(0, hh, 0);
  const base = [
    new THREE.Vector3(-hw, -hh, -hd),
    new THREE.Vector3(hw, -hh, -hd),
    new THREE.Vector3(hw, -hh, hd),
    new THREE.Vector3(-hw, -hh, hd),
  ];

  const positions: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  // Walk the base CCW from above; (corner, apex, next) points each wall outward.
  for (let i = 0; i < 4; i++) {
    tri(base[i], apex, base[(i + 1) % 4]);
  }
  tri(base[0], base[1], base[2]);
  tri(base[0], base[2], base[3]);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}
