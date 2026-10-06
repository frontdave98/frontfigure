/** 1 stud = 1 world unit */
export const STUD = 1;
export const BRICK_HEIGHT = 1.2;
export const PLATE_HEIGHT = 0.4;
export const STUD_HEIGHT = 0.18;
export const STUD_RADIUS = 0.28;
export const GRID_HALF = 24;

export function nextRotation(current: 0 | 90 | 180 | 270): 0 | 90 | 180 | 270 {
  const order = [0, 90, 180, 270] as const;
  return order[(order.indexOf(current) + 1) % 4];
}
