"use client";

import { useEffect, useMemo, useState } from "react";
import { getPart } from "@/lib/bricks/catalog";
import {
  familyFromPartId,
  hasTopStudsOption,
  listSizes,
  PART_FAMILIES,
  resolvePartId,
  sizeLabel,
  supportsCustomSize,
  type FootprintSize,
  type PartFamily,
} from "@/lib/bricks/families";
import { familySwatch, PartGlyph as ShapeGlyph } from "@/components/brand/PartGlyph";
import { MAX_CUSTOM_FOOTPRINT } from "@/lib/bricks/units";
import { useEditorStore } from "@/store/editorStore";

const DEFAULT_FAMILY: PartFamily = "brick";
const DEFAULT_SIZE: FootprintSize = { w: 1, d: 1 };

const SHORT_LABEL: Partial<Record<PartFamily, string>> = {
  "round-plate": "R-plate",
};

export function Palette() {
  const activePartId = useEditorStore((s) => s.activePartId);
  const setActivePart = useEditorStore((s) => s.setActivePart);

  const [family, setFamily] = useState<PartFamily>(DEFAULT_FAMILY);
  const [size, setSize] = useState<FootprintSize>(DEFAULT_SIZE);
  const [topStuds, setTopStuds] = useState(true);
  const [sizeMode, setSizeMode] = useState<"presets" | "custom">("presets");
  const [customW, setCustomW] = useState(3);
  const [customD, setCustomD] = useState(2);

  const sizes = useMemo(() => listSizes(family), [family]);
  const customEnabled = supportsCustomSize(family);

  useEffect(() => {
    if (!activePartId) return;
    const part = getPart(activePartId);
    const nextFamily = familyFromPartId(activePartId);
    if (!part || !nextFamily) return;
    setFamily(nextFamily);
    setSize({ w: part.footprint.w, d: part.footprint.d });
    setTopStuds(part.topStuds);
    const isCustom = activePartId.startsWith("custom-");
    setSizeMode(isCustom ? "custom" : "presets");
    if (isCustom) {
      setCustomW(part.footprint.w);
      setCustomD(part.footprint.d);
    }
  }, [activePartId]);

  useEffect(() => {
    if (!customEnabled && sizeMode === "custom") setSizeMode("presets");
  }, [customEnabled, sizeMode]);

  useEffect(() => {
    const available = listSizes(family);
    if (available.length === 0) return;
    const stillValid = available.some((s) => s.w === size.w && s.d === size.d);
    if (!stillValid && sizeMode === "presets") setSize(available[0]);
  }, [family, size.w, size.d, sizeMode]);

  const activeSize =
    sizeMode === "custom" && customEnabled
      ? { w: customW, d: customD }
      : size;

  const resolvedId = resolvePartId(
    family,
    activeSize.w,
    activeSize.d,
    topStuds,
  );
  const resolvedPart = resolvedId ? getPart(resolvedId) : undefined;
  const canStuds = hasTopStudsOption(family, activeSize.w, activeSize.d, true);
  const canFlat = hasTopStudsOption(family, activeSize.w, activeSize.d, false);
  const showTopToggle = canStuds && canFlat;
  const armed = !!activePartId && !!resolvedPart;

  const applyPart = (
    nextFamily: PartFamily,
    nextSize: FootprintSize,
    nextTopStuds: boolean,
    mode: "presets" | "custom" = sizeMode,
  ) => {
    let studs = nextTopStuds;
    if (!hasTopStudsOption(nextFamily, nextSize.w, nextSize.d, studs)) {
      if (hasTopStudsOption(nextFamily, nextSize.w, nextSize.d, true)) {
        studs = true;
      } else if (hasTopStudsOption(nextFamily, nextSize.w, nextSize.d, false)) {
        studs = false;
      } else {
        return;
      }
    }
    const id = resolvePartId(nextFamily, nextSize.w, nextSize.d, studs);
    if (!id) return;
    setFamily(nextFamily);
    setSizeMode(mode);
    if (mode === "custom") {
      setCustomW(nextSize.w);
      setCustomD(nextSize.d);
    } else {
      setSize(nextSize);
    }
    setTopStuds(studs);
    setActivePart(id);
  };

  const onShapeClick = (next: PartFamily) => {
    if (next === family && activePartId && familyFromPartId(activePartId) === next) {
      setActivePart(null);
      return;
    }
    const nextCustom = supportsCustomSize(next) && sizeMode === "custom";
    if (nextCustom) {
      applyPart(next, { w: customW, d: customD }, topStuds, "custom");
      return;
    }
    const nextSizes = listSizes(next);
    const nextSize =
      nextSizes.find((s) => s.w === size.w && s.d === size.d) ??
      nextSizes[0] ??
      DEFAULT_SIZE;
    applyPart(next, nextSize, topStuds, "presets");
  };

  const setCustomDim = (next: { w?: number; d?: number }) => {
    const w = next.w ?? customW;
    const d = next.d ?? customD;
    setCustomW(w);
    setCustomD(d);
    applyPart(family, { w, d }, topStuds, "custom");
  };

  return (
    <aside className="ff-hud-panel pointer-events-auto flex w-72 flex-col gap-3 self-start rounded-xl p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
          Parts
        </p>
        <h2 className="font-display text-lg font-bold leading-tight">Brick bay</h2>
        <div
          className="ff-well relative mt-2 flex items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2"
          style={{
            boxShadow: armed
              ? `inset 3px 0 0 ${resolvedPart?.colorDefault ?? "var(--ff-accent)"}`
              : undefined,
          }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
            style={{
              background: armed
                ? (resolvedPart?.colorDefault ?? "var(--ff-panel-2)")
                : "var(--ff-panel-2)",
              boxShadow: armed
                ? "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.2)"
                : "inset 0 1px 2px rgba(0,0,0,0.12)",
            }}
          >
            <ShapeGlyph
              family={family}
              active={armed}
              color={armed ? "rgba(255,255,255,0.95)" : undefined}
              size="lg"
            />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ff-accent)]">
              {armed ? "Ready to place" : "No part loaded"}
            </p>
            <p className="truncate font-display text-sm font-bold leading-tight">
              {armed && resolvedPart ? resolvedPart.label : "Pick a shape"}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
          Shape
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {PART_FAMILIES.map((f) => {
            const active = family === f.id && !!activePartId;
            const swatch = familySwatch(f.id);
            return (
              <button
                key={f.id}
                type="button"
                title={`${f.label} · ${f.hint}`}
                className={`ff-palette-item flex min-w-0 flex-col items-center gap-1 rounded-lg p-0.5 ${
                  active ? "is-active" : ""
                }`}
                onClick={() => onShapeClick(f.id)}
              >
                <span
                  className="flex h-11 w-full items-center justify-center rounded-md"
                  style={{
                    background: active
                      ? `color-mix(in srgb, ${swatch} 34%, var(--ff-panel))`
                      : `color-mix(in srgb, ${swatch} 14%, var(--ff-panel-2))`,
                    boxShadow: active
                      ? `inset 0 0 0 1px ${swatch}`
                      : "inset 0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  <ShapeGlyph
                    family={f.id}
                    active={active}
                    color={swatch}
                    size="md"
                  />
                </span>
                <span
                  className={`w-full px-0.5 text-center text-[10px] font-semibold leading-[1.15] ${
                    active ? "text-[var(--ff-text)]" : "text-[var(--ff-muted)]"
                  }`}
                >
                  {SHORT_LABEL[f.id] ?? f.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
          Size
        </p>
        {sizeMode === "custom" && customEnabled ? (
          <div className="ff-well flex items-center gap-1.5 rounded-lg p-1">
            <Stepper
              label="W"
              value={customW}
              onChange={(w) => setCustomDim({ w })}
            />
            <Stepper
              label="D"
              value={customD}
              onChange={(d) => setCustomDim({ d })}
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs h-8 min-h-0 px-2"
              onClick={() => applyPart(family, size, topStuds, "presets")}
            >
              Presets
            </button>
          </div>
        ) : (
          <div className="ff-well flex overflow-hidden rounded-lg p-0.5">
            {sizes.map((s) => {
              const selected = s.w === size.w && s.d === size.d;
              const lit = selected && armed && sizeMode === "presets";
              return (
                <button
                  key={`${s.w}x${s.d}`}
                  type="button"
                  className={`ff-palette-item flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 ${
                    lit ? "is-active bg-[var(--ff-panel)]" : ""
                  }`}
                  onClick={() => applyPart(family, s, topStuds, "presets")}
                >
                  <SizeGlyph
                    size={s}
                    round={isRoundFamily(family)}
                    color={
                      lit
                        ? (resolvedPart?.colorDefault ?? "var(--ff-accent)")
                        : "var(--ff-muted)"
                    }
                  />
                  <span className="text-[10px] font-semibold tabular-nums">
                    {sizeLabel(s)}
                  </span>
                </button>
              );
            })}
            {customEnabled && (
              <button
                type="button"
                className="ff-palette-item flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[var(--ff-muted)]"
                onClick={() =>
                  applyPart(
                    family,
                    { w: customW, d: customD },
                    topStuds,
                    "custom",
                  )
                }
              >
                <span className="font-display text-base leading-none">+</span>
                <span className="text-[10px] font-semibold">Custom</span>
              </button>
            )}
          </div>
        )}
      </section>

      {showTopToggle && (
        <section className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Top
          </p>
          <div
            className="ff-well flex rounded-lg p-0.5"
            title="Flat = no top connector; can still snap onto studs below."
          >
            <button
              type="button"
              className={`h-8 flex-1 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                topStuds && armed
                  ? "bg-[var(--ff-accent)] text-[#14110b] shadow-sm"
                  : "text-[var(--ff-muted)] hover:text-[var(--ff-text)]"
              }`}
              onClick={() => applyPart(family, activeSize, true, sizeMode)}
            >
              Studs
            </button>
            <button
              type="button"
              className={`h-8 flex-1 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                !topStuds && armed
                  ? "bg-[var(--ff-accent)] text-[#14110b] shadow-sm"
                  : "text-[var(--ff-muted)] hover:text-[var(--ff-text)]"
              }`}
              onClick={() => applyPart(family, activeSize, false, sizeMode)}
            >
              Flat
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex h-8 min-w-0 flex-1 items-center justify-between rounded-md bg-[var(--ff-panel)] px-1.5">
      <span className="text-[10px] font-semibold text-[var(--ff-muted)]">
        {label}
      </span>
      <button
        type="button"
        className="grid h-6 w-6 place-items-center rounded text-sm leading-none text-[var(--ff-muted)] hover:bg-[var(--ff-panel-2)] hover:text-[var(--ff-text)]"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="w-4 text-center text-xs font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className="grid h-6 w-6 place-items-center rounded text-sm leading-none text-[var(--ff-muted)] hover:bg-[var(--ff-panel-2)] hover:text-[var(--ff-text)]"
        onClick={() => onChange(Math.min(MAX_CUSTOM_FOOTPRINT, value + 1))}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

function isRoundFamily(family: PartFamily): boolean {
  return (
    family === "round" ||
    family === "round-plate" ||
    family === "cone" ||
    family === "sphere"
  );
}

function SizeGlyph({
  size,
  round,
  color,
}: {
  size: FootprintSize;
  round: boolean;
  color?: string;
}) {
  const max = Math.max(size.w, size.d);
  const unit = 14 / max;
  const w = Math.max(6, size.w * unit);
  const h = Math.max(6, size.d * unit);
  return (
    <span className="flex h-5 w-6 items-center justify-center">
      <span
        className={round ? "rounded-full" : "rounded-[2px]"}
        style={{
          width: w,
          height: round ? w : h,
          background: color ?? "var(--ff-muted)",
          opacity: 0.9,
        }}
      />
    </span>
  );
}
