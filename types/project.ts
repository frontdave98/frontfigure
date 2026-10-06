export type RotationY = 0 | 90 | 180 | 270;

export type Vec3 = { x: number; y: number; z: number };

export type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
};

export type BrickFinish = "opaque" | "glass";

export type PlacedBrick = {
  instanceId: string;
  partId: string;
  color: string; // #RRGGBB
  finish?: BrickFinish; // default "opaque" for older saves
  position: Vec3;
  rotationY: RotationY;
};

export type Scene = {
  bricks: PlacedBrick[];
  camera?: CameraState;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  scene: Scene;
};

export type ToolMode = "select" | "place";

export const BRICK_SOFT_LIMIT = 500;

export const DEFAULT_CAMERA: CameraState = {
  position: [12, 10, 14],
  target: [0, 0, 0],
};

export function emptyScene(): Scene {
  return { bricks: [], camera: { ...DEFAULT_CAMERA } };
}
