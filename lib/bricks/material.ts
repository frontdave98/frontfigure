import type { BrickFinish } from "@/types/project";

export function resolveFinish(finish?: BrickFinish): BrickFinish {
  return finish === "glass" ? "glass" : "opaque";
}

export const GLASS = {
  opacity: 0.4,
  transmission: 0.85,
  roughness: 0.05,
  metalness: 0,
  thickness: 0.5,
  ior: 1.45,
} as const;
