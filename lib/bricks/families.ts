import {
  BRICK_CATALOG,
  getPart,
  makeCustomBoxPartId,
  type BrickPart,
  type CustomBoxKind,
} from "./catalog";
import { BRICK_HEIGHT, CUBE_HEIGHT, MAX_CUSTOM_FOOTPRINT, PLATE_HEIGHT } from "./units";

export type PartFamily =
  | "brick"
  | "plate"
  | "round"
  | "round-plate"
  | "cube"
  | "trapezium"
  | "slope"
  | "cone"
  | "pyramid"
  | "sphere";

export type FootprintSize = { w: number; d: number };

export const PART_FAMILIES: {
  id: PartFamily;
  label: string;
  hint: string;
}[] = [
  { id: "brick", label: "Brick", hint: "Box · tall" },
  { id: "plate", label: "Plate", hint: "Box · thin" },
  { id: "round", label: "Round", hint: "Cylinder · tall" },
  { id: "round-plate", label: "Round plate", hint: "Cylinder · thin" },
  { id: "cube", label: "Cube", hint: "Box · 1 stud" },
  { id: "trapezium", label: "Trapezium", hint: "Wide base · flat top" },
  { id: "slope", label: "Slope", hint: "Wedge · rises on width" },
  { id: "cone", label: "Cone", hint: "Tapered round" },
  { id: "pyramid", label: "Pyramid", hint: "Tapered box" },
  { id: "sphere", label: "Sphere", hint: "Ball" },
];

function matchesFamily(part: BrickPart, family: PartFamily): boolean {
  switch (family) {
    case "brick":
      return (
        part.category === "brick" &&
        part.shape === "box" &&
        part.height === BRICK_HEIGHT
      );
    case "plate":
      return (
        part.category === "plate" &&
        part.shape === "box" &&
        part.height === PLATE_HEIGHT
      );
    case "cube":
      return part.shape === "box" && part.height === CUBE_HEIGHT;
    case "round":
      return (
        part.category === "round" &&
        part.shape === "cylinder" &&
        part.height === BRICK_HEIGHT
      );
    case "round-plate":
      return (
        part.category === "round" &&
        part.shape === "cylinder" &&
        part.height === PLATE_HEIGHT
      );
    case "trapezium":
      return part.shape === "trapezoid";
    case "slope":
      return part.shape === "wedge";
    case "cone":
      return part.shape === "cone";
    case "pyramid":
      return part.shape === "pyramid";
    case "sphere":
      return part.shape === "sphere";
  }
}

export function listSizes(family: PartFamily): FootprintSize[] {
  const seen = new Set<string>();
  const sizes: FootprintSize[] = [];
  for (const part of BRICK_CATALOG) {
    if (!matchesFamily(part, family)) continue;
    const key = `${part.footprint.w}x${part.footprint.d}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sizes.push({ w: part.footprint.w, d: part.footprint.d });
  }
  return sizes.sort((a, b) => a.w * a.d - b.w * b.d || a.w - b.w);
}

export function supportsCustomSize(family: PartFamily): boolean {
  return family === "brick" || family === "plate" || family === "cube";
}

export function resolvePartId(
  family: PartFamily,
  w: number,
  d: number,
  topStuds: boolean,
): string | null {
  const found = BRICK_CATALOG.find(
    (part) =>
      matchesFamily(part, family) &&
      part.footprint.w === w &&
      part.footprint.d === d &&
      part.topStuds === topStuds,
  );
  if (found) return found.id;
  if (
    supportsCustomSize(family) &&
    w >= 1 &&
    w <= MAX_CUSTOM_FOOTPRINT &&
    d >= 1 &&
    d <= MAX_CUSTOM_FOOTPRINT
  ) {
    return makeCustomBoxPartId(family as CustomBoxKind, w, d, topStuds);
  }
  return null;
}

export function hasTopStudsOption(
  family: PartFamily,
  w: number,
  d: number,
  topStuds: boolean,
): boolean {
  return resolvePartId(family, w, d, topStuds) !== null;
}

export function familyFromPartId(partId: string): PartFamily | null {
  const part = getPart(partId);
  if (!part) return null;
  for (const family of PART_FAMILIES) {
    if (matchesFamily(part, family.id)) return family.id;
  }
  return null;
}

export function sizeLabel(size: FootprintSize): string {
  return `${size.w}×${size.d}`;
}
