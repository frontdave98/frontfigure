import { getPart } from "@/lib/bricks/catalog";
import {
  listSizes,
  resolvePartId,
  type PartFamily,
} from "@/lib/bricks/families";

export function familySwatch(family: PartFamily): string {
  const sizes = listSizes(family);
  const first = sizes[0] ?? { w: 1, d: 1 };
  const id =
    resolvePartId(family, first.w, first.d, true) ??
    resolvePartId(family, first.w, first.d, false);
  return (id && getPart(id)?.colorDefault) || "var(--ff-muted)";
}

export function PartGlyph({
  family,
  active,
  color,
  size = "md",
}: {
  family: PartFamily;
  active: boolean;
  color?: string;
  size?: "md" | "lg";
}) {
  const fill = color ?? (active ? "var(--ff-accent)" : "var(--ff-muted)");
  const style = { background: fill, opacity: color || active ? 1 : 0.7 };
  const lg = size === "lg";
  switch (family) {
    case "round":
    case "sphere":
      return (
        <span
          className={`block rounded-full ${lg ? "h-6 w-6" : "h-5 w-5"}`}
          style={style}
        />
      );
    case "round-plate":
      return (
        <span
          className={`block rounded-full ${lg ? "h-3 w-7" : "h-2.5 w-6"}`}
          style={style}
        />
      );
    case "plate":
      return (
        <span
          className={`block rounded-sm ${lg ? "h-2.5 w-7" : "h-2 w-6"}`}
          style={style}
        />
      );
    case "cube":
      return (
        <span
          className={`block rounded-sm ${lg ? "h-6 w-6" : "h-5 w-5"}`}
          style={style}
        />
      );
    case "trapezium":
      return (
        <span
          className={lg ? "block h-6 w-7" : "block h-5 w-6"}
          style={{
            ...style,
            clipPath: "polygon(14% 0, 86% 0, 100% 100%, 0 100%)",
          }}
        />
      );
    case "slope":
      return (
        <span
          className={lg ? "block h-6 w-7" : "block h-5 w-6"}
          style={{
            ...style,
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />
      );
    case "cone":
    case "pyramid":
      return (
        <span
          className={lg ? "block h-6 w-6" : "block h-5 w-5"}
          style={{
            ...style,
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          }}
        />
      );
    case "brick":
    default:
      return (
        <span
          className={`block rounded-sm ${lg ? "h-6 w-7" : "h-5 w-6"}`}
          style={style}
        />
      );
  }
}
