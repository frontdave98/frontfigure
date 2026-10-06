import type { CameraState, PlacedBrick } from "@/types/project";
import { getFootprint } from "./placement";

export type SceneBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  center: [number, number, number];
  size: number;
};

export function computeBricksBounds(bricks: PlacedBrick[]): SceneBounds | null {
  if (bricks.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const brick of bricks) {
    const fp = getFootprint(brick);
    minX = Math.min(minX, fp.minX);
    maxX = Math.max(maxX, fp.maxX);
    minY = Math.min(minY, fp.y);
    maxY = Math.max(maxY, fp.y + fp.height);
    minZ = Math.min(minZ, fp.minZ);
    maxZ = Math.max(maxZ, fp.maxZ);
  }

  const center: [number, number, number] = [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2,
  ];
  const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 2);

  return { minX, maxX, minY, maxY, minZ, maxZ, center, size };
}

/** Camera framing looking toward bounds center from a diagonal. */
export function cameraForBounds(bounds: SceneBounds): CameraState {
  const dist = Math.max(8, bounds.size * 2.2);
  const [cx, cy, cz] = bounds.center;
  return {
    position: [cx + dist * 0.75, cy + dist * 0.55, cz + dist * 0.85],
    target: [cx, cy, cz],
  };
}
