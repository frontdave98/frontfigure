import type { PlacedBrick, RotationY, Vec3 } from "@/types/project";
import { partHasTopStuds, requirePart } from "./catalog";
import { GRID_HALF } from "./units";

export type Footprint = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  height: number;
};

function rotatedSize(
  w: number,
  d: number,
  rotationY: RotationY,
): { w: number; d: number } {
  if (rotationY === 90 || rotationY === 270) return { w: d, d: w };
  return { w, d };
}

/** Brick position is the center of the footprint on XZ; Y is the bottom of the brick. */
export function getFootprint(brick: PlacedBrick): Footprint {
  const part = requirePart(brick.partId);
  const { w, d } = rotatedSize(
    part.footprint.w,
    part.footprint.d,
    brick.rotationY,
  );
  return {
    minX: brick.position.x - w / 2,
    maxX: brick.position.x + w / 2,
    minZ: brick.position.z - d / 2,
    maxZ: brick.position.z + d / 2,
    y: brick.position.y,
    height: part.height,
  };
}

function footprintsOverlap(a: Footprint, b: Footprint, eps = 0.01): boolean {
  return (
    a.minX < b.maxX - eps &&
    a.maxX > b.minX + eps &&
    a.minZ < b.maxZ - eps &&
    a.maxZ > b.minZ + eps
  );
}

function verticalOverlap(a: Footprint, b: Footprint, eps = 0.01): boolean {
  const aTop = a.y + a.height;
  const bTop = b.y + b.height;
  return a.y < bTop - eps && aTop > b.y + eps;
}

export function snapXZ(x: number, z: number, w: number, d: number): Vec3 {
  const halfW = w / 2;
  const halfD = d / 2;
  const cornerX = Math.round(x - halfW);
  const cornerZ = Math.round(z - halfD);
  return {
    x: cornerX + halfW,
    y: 0,
    z: cornerZ + halfD,
  };
}

export function snapPoint(
  hit: Vec3,
  partId: string,
  rotationY: RotationY,
  bricks: PlacedBrick[],
  excludeId?: string,
): { position: Vec3; valid: boolean } {
  const part = requirePart(partId);
  const { w, d } = rotatedSize(
    part.footprint.w,
    part.footprint.d,
    rotationY,
  );
  const xz = snapXZ(hit.x, hit.z, w, d);

  // Clamp to build area
  if (
    Math.abs(xz.x) > GRID_HALF ||
    Math.abs(xz.z) > GRID_HALF
  ) {
    return { position: { ...xz, y: 0 }, valid: false };
  }

  const candidates = bricks.filter((b) => b.instanceId !== excludeId);
  let supportY = 0;

  // Find highest supporting top under this footprint
  const ghostBase: Footprint = {
    minX: xz.x - w / 2,
    maxX: xz.x + w / 2,
    minZ: xz.z - d / 2,
    maxZ: xz.z + d / 2,
    y: 0,
    height: part.height,
  };

  for (const b of candidates) {
    // Flat / non-connector tops cannot support stacking
    if (!partHasTopStuds(b.partId)) continue;
    const fp = getFootprint(b);
    if (footprintsOverlap(ghostBase, fp)) {
      const top = fp.y + fp.height;
      if (top > supportY) supportY = top;
    }
  }

  const position: Vec3 = { x: xz.x, y: supportY, z: xz.z };
  const placedFp: Footprint = { ...ghostBase, y: supportY };

  // Reject hard collision with any brick at this band
  for (const b of candidates) {
    const fp = getFootprint(b);
    if (footprintsOverlap(placedFp, fp) && verticalOverlap(placedFp, fp)) {
      return { position, valid: false };
    }
  }

  return { position, valid: true };
}

export function canPlace(
  partId: string,
  position: Vec3,
  rotationY: RotationY,
  bricks: PlacedBrick[],
  excludeId?: string,
): boolean {
  const result = snapPoint(
    position,
    partId,
    rotationY,
    bricks,
    excludeId,
  );
  return (
    result.valid &&
    Math.abs(result.position.x - position.x) < 0.01 &&
    Math.abs(result.position.z - position.z) < 0.01 &&
    Math.abs(result.position.y - position.y) < 0.01
  );
}

/** Re-snap a brick after part/size or rotation change so centers stay on the stud grid. */
export function resnapBrick(
  brick: PlacedBrick,
  bricks: PlacedBrick[],
  overrides?: Partial<Pick<PlacedBrick, "partId" | "rotationY">>,
): Vec3 {
  const partId = overrides?.partId ?? brick.partId;
  const rotationY = overrides?.rotationY ?? brick.rotationY;
  const { position } = snapPoint(
    brick.position,
    partId,
    rotationY,
    bricks,
    brick.instanceId,
  );
  return position;
}
