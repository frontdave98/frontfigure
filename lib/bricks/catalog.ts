import {
  BRICK_HEIGHT,
  CUBE_HEIGHT,
  MAX_CUSTOM_FOOTPRINT,
  PLATE_HEIGHT,
} from "./units";

export type PartShape =
  | "box"
  | "cylinder"
  | "trapezoid"
  | "wedge"
  | "cone"
  | "pyramid"
  | "sphere";
export type PartCategory =
  | "brick"
  | "plate"
  | "cube"
  | "round"
  | "trapezoid"
  | "wedge"
  | "cone"
  | "pyramid"
  | "sphere";
export type CustomBoxKind = "brick" | "plate" | "cube";

export type BrickPart = {
  id: string;
  label: string;
  category: PartCategory;
  shape: PartShape;
  footprint: { w: number; d: number };
  height: number;
  colorDefault: string;
  /** When true, top has studs and can support stacking. Flat parts are false. */
  topStuds: boolean;
};

type PartOpts = {
  id: string;
  label: string;
  category: PartCategory;
  shape?: PartShape;
  w: number;
  d: number;
  height: number;
  colorDefault: string;
  topStuds?: boolean;
};

function part({
  id,
  label,
  category,
  shape = "box",
  w,
  d,
  height,
  colorDefault,
  topStuds = true,
}: PartOpts): BrickPart {
  return {
    id,
    label,
    category,
    shape,
    footprint: { w, d },
    height,
    colorDefault,
    topStuds,
  };
}

const BOX_SIZES = [
  { w: 1, d: 1, tag: "1x1", label: "1×1" },
  { w: 1, d: 2, tag: "1x2", label: "1×2" },
  { w: 2, d: 2, tag: "2x2", label: "2×2" },
  { w: 2, d: 4, tag: "2x4", label: "2×4" },
] as const;

const SQUARE_SIZES = [
  { w: 1, d: 1, tag: "1x1", label: "1×1" },
  { w: 2, d: 2, tag: "2x2", label: "2×2" },
] as const;

const BOX_KIND_LABEL: Record<CustomBoxKind, string> = {
  brick: "Brick",
  plate: "Plate",
  cube: "Cube",
};

const BRICK_COLORS = ["#C41E3A", "#0055BF", "#237841", "#F5CD2F"] as const;
const PLATE_COLORS = ["#FFFFFF", "#A0A5A9", "#FE8A18", "#E4CD9E"] as const;
const CUBE_COLORS = ["#B91C1C", "#1D4ED8", "#15803D", "#CA8A04"] as const;
const FLAT_BRICK_COLORS = ["#9B9A5A", "#1B2A34", "#6B7280", "#D4A017"] as const;
const FLAT_PLATE_COLORS = ["#F3F4F6", "#6B7280", "#C2410C", "#A8A29E"] as const;
const FLAT_CUBE_COLORS = ["#78716C", "#334155", "#4B5563", "#A16207"] as const;
const TRAPEZOID_COLORS = ["#7C3AED", "#0EA5E9", "#059669", "#D97706"] as const;
const FLAT_TRAPEZOID_COLORS = ["#5B21B6", "#075985", "#065F46", "#92400E"] as const;
const SLOPE_COLORS = ["#E11D48", "#2563EB", "#16A34A", "#CA8A04"] as const;
const CONE_COLORS = ["#DB2777", "#0284C7"] as const;
const PYRAMID_COLORS = ["#9333EA", "#0D9488", "#65A30D", "#EA580C"] as const;
const SPHERE_COLORS = ["#F43F5E", "#3B82F6"] as const;

function boxParts(
  kind: CustomBoxKind,
  height: number,
  colors: readonly string[],
  flatColors: readonly string[],
): BrickPart[] {
  const out: BrickPart[] = [];
  BOX_SIZES.forEach((size, i) => {
    out.push(
      part({
        id: `${kind}-${size.tag}`,
        label: `${BOX_KIND_LABEL[kind]} ${size.label}`,
        category: kind,
        w: size.w,
        d: size.d,
        height,
        colorDefault: colors[i] ?? "#888888",
        topStuds: true,
      }),
    );
    out.push(
      part({
        id: `${kind}-${size.tag}-flat`,
        label: `${BOX_KIND_LABEL[kind]} ${size.label} Flat`,
        category: kind,
        w: size.w,
        d: size.d,
        height,
        colorDefault: flatColors[i] ?? "#888888",
        topStuds: false,
      }),
    );
  });
  return out;
}

function sizedParts(
  sizes: readonly { w: number; d: number; tag: string; label: string }[],
  colors: readonly string[],
  make: (size: (typeof sizes)[number], color: string) => BrickPart,
): BrickPart[] {
  return sizes.map((size, i) => make(size, colors[i] ?? "#888888"));
}

export const BRICK_CATALOG: BrickPart[] = [
  ...boxParts("brick", BRICK_HEIGHT, BRICK_COLORS, FLAT_BRICK_COLORS),
  ...boxParts("plate", PLATE_HEIGHT, PLATE_COLORS, FLAT_PLATE_COLORS),
  ...boxParts("cube", CUBE_HEIGHT, CUBE_COLORS, FLAT_CUBE_COLORS),
  part({
    id: "round-1x1",
    label: "Round 1×1",
    category: "round",
    shape: "cylinder",
    w: 1,
    d: 1,
    height: BRICK_HEIGHT,
    colorDefault: "#C41E3A",
    topStuds: true,
  }),
  part({
    id: "round-1x1-flat",
    label: "Round 1×1 Flat",
    category: "round",
    shape: "cylinder",
    w: 1,
    d: 1,
    height: BRICK_HEIGHT,
    colorDefault: "#0055BF",
    topStuds: false,
  }),
  part({
    id: "round-plate-1x1",
    label: "Round Plate 1×1",
    category: "round",
    shape: "cylinder",
    w: 1,
    d: 1,
    height: PLATE_HEIGHT,
    colorDefault: "#FFFFFF",
    topStuds: true,
  }),
  part({
    id: "round-plate-1x1-flat",
    label: "Round Plate 1×1 Flat",
    category: "round",
    shape: "cylinder",
    w: 1,
    d: 1,
    height: PLATE_HEIGHT,
    colorDefault: "#A0A5A9",
    topStuds: false,
  }),
  ...BOX_SIZES.flatMap((size, i) => [
    part({
      id: `trapezium-${size.tag}`,
      label: `Trapezium ${size.label}`,
      category: "trapezoid",
      shape: "trapezoid",
      w: size.w,
      d: size.d,
      height: BRICK_HEIGHT,
      colorDefault: TRAPEZOID_COLORS[i] ?? "#888888",
      topStuds: true,
    }),
    part({
      id: `trapezium-${size.tag}-flat`,
      label: `Trapezium ${size.label} Flat`,
      category: "trapezoid",
      shape: "trapezoid",
      w: size.w,
      d: size.d,
      height: BRICK_HEIGHT,
      colorDefault: FLAT_TRAPEZOID_COLORS[i] ?? "#888888",
      topStuds: false,
    }),
  ]),
  ...sizedParts(BOX_SIZES, SLOPE_COLORS, (size, color) =>
    part({
      id: `slope-${size.tag}`,
      label: `Slope ${size.label}`,
      category: "wedge",
      shape: "wedge",
      w: size.w,
      d: size.d,
      height: BRICK_HEIGHT,
      colorDefault: color,
      topStuds: false,
    }),
  ),
  ...sizedParts(SQUARE_SIZES, CONE_COLORS, (size, color) =>
    part({
      id: `cone-${size.tag}`,
      label: `Cone ${size.label}`,
      category: "cone",
      shape: "cone",
      w: size.w,
      d: size.d,
      height: BRICK_HEIGHT,
      colorDefault: color,
      topStuds: false,
    }),
  ),
  ...sizedParts(BOX_SIZES, PYRAMID_COLORS, (size, color) =>
    part({
      id: `pyramid-${size.tag}`,
      label: `Pyramid ${size.label}`,
      category: "pyramid",
      shape: "pyramid",
      w: size.w,
      d: size.d,
      height: BRICK_HEIGHT,
      colorDefault: color,
      topStuds: false,
    }),
  ),
  ...sizedParts(SQUARE_SIZES, SPHERE_COLORS, (size, color) =>
    part({
      id: `sphere-${size.tag}`,
      label: `Sphere ${size.label}`,
      category: "sphere",
      shape: "sphere",
      w: size.w,
      d: size.d,
      height: 0.96 * Math.min(size.w, size.d),
      colorDefault: color,
      topStuds: false,
    }),
  ),
];

export const COLOR_PRESETS = [
  "#C41E3A",
  "#0055BF",
  "#237841",
  "#F5CD2F",
  "#FFFFFF",
  "#1B2A34",
  "#A0A5A9",
  "#FE8A18",
  "#E4CD9E",
  "#9B9A5A",
] as const;

const byId = new Map(BRICK_CATALOG.map((p) => [p.id, p]));

const CUSTOM_BOX_HEIGHT: Record<CustomBoxKind, number> = {
  brick: BRICK_HEIGHT,
  plate: PLATE_HEIGHT,
  cube: CUBE_HEIGHT,
};

/** custom-box-{w}x{d}-{brick|plate|cube}-{studs|flat} */
const CUSTOM_BOX_RE =
  /^custom-box-(\d+)x(\d+)-(brick|plate|cube)-(studs|flat)$/;

export function parseCustomPartId(partId: string): BrickPart | undefined {
  const m = CUSTOM_BOX_RE.exec(partId);
  if (!m) return undefined;
  const w = Number(m[1]);
  const d = Number(m[2]);
  const kind = m[3] as CustomBoxKind;
  const topStuds = m[4] === "studs";
  if (
    !Number.isInteger(w) ||
    !Number.isInteger(d) ||
    w < 1 ||
    w > MAX_CUSTOM_FOOTPRINT ||
    d < 1 ||
    d > MAX_CUSTOM_FOOTPRINT
  ) {
    return undefined;
  }
  return {
    id: partId,
    label: `${BOX_KIND_LABEL[kind]} ${w}×${d}${topStuds ? "" : " Flat"}`,
    category: kind,
    shape: "box",
    footprint: { w, d },
    height: CUSTOM_BOX_HEIGHT[kind],
    colorDefault: topStuds ? "#C41E3A" : "#6B7280",
    topStuds,
  };
}

export function makeCustomBoxPartId(
  kind: CustomBoxKind,
  w: number,
  d: number,
  topStuds: boolean,
): string {
  return `custom-box-${w}x${d}-${kind}-${topStuds ? "studs" : "flat"}`;
}

export function getPart(partId: string): BrickPart | undefined {
  return byId.get(partId) ?? parseCustomPartId(partId);
}

export function requirePart(partId: string): BrickPart {
  const p = getPart(partId);
  if (!p) throw new Error(`Unknown part: ${partId}`);
  return p;
}

export function partHasTopStuds(partId: string): boolean {
  return getPart(partId)?.topStuds !== false;
}
