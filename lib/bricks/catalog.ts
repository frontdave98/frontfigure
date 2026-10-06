import { BRICK_HEIGHT, PLATE_HEIGHT } from "./units";

export type PartShape = "box" | "cylinder";
export type PartCategory = "brick" | "plate" | "round";

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

const BRICK_COLORS = ["#C41E3A", "#0055BF", "#237841", "#F5CD2F"] as const;
const PLATE_COLORS = ["#FFFFFF", "#A0A5A9", "#FE8A18", "#E4CD9E"] as const;
const FLAT_BRICK_COLORS = ["#9B9A5A", "#1B2A34", "#6B7280", "#D4A017"] as const;
const FLAT_PLATE_COLORS = ["#F3F4F6", "#6B7280", "#C2410C", "#A8A29E"] as const;

function boxParts(
  kind: "brick" | "plate",
  height: number,
  colors: readonly string[],
  flatColors: readonly string[],
): BrickPart[] {
  const out: BrickPart[] = [];
  BOX_SIZES.forEach((size, i) => {
    out.push(
      part({
        id: `${kind}-${size.tag}`,
        label: `${kind === "brick" ? "Brick" : "Plate"} ${size.label}`,
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
        label: `${kind === "brick" ? "Brick" : "Plate"} ${size.label} Flat`,
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

export const BRICK_CATALOG: BrickPart[] = [
  ...boxParts("brick", BRICK_HEIGHT, BRICK_COLORS, FLAT_BRICK_COLORS),
  ...boxParts("plate", PLATE_HEIGHT, PLATE_COLORS, FLAT_PLATE_COLORS),
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

/** custom-box-{w}x{d}-{brick|plate}-{studs|flat} */
const CUSTOM_BOX_RE =
  /^custom-box-(\d+)x(\d+)-(brick|plate)-(studs|flat)$/;

export function parseCustomPartId(partId: string): BrickPart | undefined {
  const m = CUSTOM_BOX_RE.exec(partId);
  if (!m) return undefined;
  const w = Number(m[1]);
  const d = Number(m[2]);
  const kind = m[3] as "brick" | "plate";
  const topStuds = m[4] === "studs";
  if (
    !Number.isInteger(w) ||
    !Number.isInteger(d) ||
    w < 1 ||
    w > 8 ||
    d < 1 ||
    d > 8
  ) {
    return undefined;
  }
  return {
    id: partId,
    label: `${kind === "brick" ? "Brick" : "Plate"} ${w}×${d}${topStuds ? "" : " Flat"}`,
    category: kind,
    shape: "box",
    footprint: { w, d },
    height: kind === "brick" ? BRICK_HEIGHT : PLATE_HEIGHT,
    colorDefault: topStuds ? "#C41E3A" : "#6B7280",
    topStuds,
  };
}

export function makeCustomBoxPartId(
  kind: "brick" | "plate",
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
