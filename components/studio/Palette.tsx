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
import { useEditorStore } from "@/store/editorStore";

const DEFAULT_FAMILY: PartFamily = "brick";
const DEFAULT_SIZE: FootprintSize = { w: 1, d: 1 };

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

  return (
    <aside className="ff-hud-panel pointer-events-auto flex h-full w-64 flex-col gap-3 overflow-hidden rounded-xl p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
          Parts
        </p>
        <h2 className="font-display text-lg font-bold leading-tight">Brick bay</h2>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`h-7 w-7 shrink-0 border border-[var(--ff-border)] shadow-inner ${
              family === "round" || family === "round-plate"
                ? "rounded-full"
                : "rounded-md"
            }`}
            style={{
              background: resolvedPart?.colorDefault ?? "var(--ff-panel-2)",
            }}
          />
          <p className="min-w-0 truncate text-xs text-[var(--ff-muted)]">
            {activePartId && resolvedPart
              ? resolvedPart.label
              : "Pick a shape to place"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Shape
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PART_FAMILIES.map((f) => {
              const active = family === f.id && !!activePartId;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`ff-palette-item flex flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left ${
                    active
                      ? "is-active border-[var(--ff-accent)]"
                      : "border-[var(--ff-border)] bg-[var(--ff-panel-2)]"
                  }`}
                  onClick={() => onShapeClick(f.id)}
                >
                  <ShapeGlyph family={f.id} active={active} />
                  <span className="text-sm font-medium leading-tight">{f.label}</span>
                  <span className="text-[10px] text-[var(--ff-muted)]">{f.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
              Size
            </p>
            {customEnabled && (
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`btn btn-xs ${sizeMode === "presets" ? "ff-btn-primary" : "btn-ghost"}`}
                  onClick={() => {
                    setSizeMode("presets");
                    applyPart(family, size, topStuds, "presets");
                  }}
                >
                  Presets
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${sizeMode === "custom" ? "ff-btn-primary" : "btn-ghost"}`}
                  onClick={() => {
                    setSizeMode("custom");
                    applyPart(
                      family,
                      { w: customW, d: customD },
                      topStuds,
                      "custom",
                    );
                  }}
                >
                  Custom
                </button>
              </div>
            )}
          </div>

          {sizeMode === "custom" && customEnabled ? (
            <div className="space-y-2 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-panel-2)] p-2.5">
              <label className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--ff-muted)]">Width (studs)</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  className="input input-xs w-16 border-[var(--ff-border)] bg-[var(--ff-bg)]"
                  value={customW}
                  onChange={(e) => {
                    const w = Math.min(
                      8,
                      Math.max(1, Number(e.target.value) || 1),
                    );
                    setCustomW(w);
                    applyPart(family, { w, d: customD }, topStuds, "custom");
                  }}
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--ff-muted)]">Depth (studs)</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  className="input input-xs w-16 border-[var(--ff-border)] bg-[var(--ff-bg)]"
                  value={customD}
                  onChange={(e) => {
                    const d = Math.min(
                      8,
                      Math.max(1, Number(e.target.value) || 1),
                    );
                    setCustomD(d);
                    applyPart(family, { w: customW, d }, topStuds, "custom");
                  }}
                />
              </label>
              <p className="text-[10px] text-[var(--ff-muted)]">
                Custom {sizeLabel({ w: customW, d: customD })} · 1–8 studs
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {sizes.map((s) => {
                const selected = s.w === size.w && s.d === size.d;
                return (
                  <button
                    key={`${s.w}x${s.d}`}
                    type="button"
                    className={`ff-palette-item flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left ${
                      selected && activePartId && sizeMode === "presets"
                        ? "is-active border-[var(--ff-accent)]"
                        : "border-[var(--ff-border)] bg-[var(--ff-panel-2)]"
                    }`}
                    onClick={() => applyPart(family, s, topStuds, "presets")}
                  >
                    <SizeGlyph
                      size={s}
                      round={family === "round" || family === "round-plate"}
                      color={
                        resolvePartId(family, s.w, s.d, topStuds)
                          ? getPart(
                              resolvePartId(family, s.w, s.d, topStuds)!,
                            )?.colorDefault
                          : undefined
                      }
                    />
                    <span className="text-sm font-medium">{sizeLabel(s)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Top
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!canStuds}
              className={`btn btn-sm flex-1 ${
                topStuds && activePartId ? "ff-btn-primary" : "btn-ghost"
              }`}
              onClick={() =>
                applyPart(family, activeSize, true, sizeMode)
              }
            >
              Studs
            </button>
            <button
              type="button"
              disabled={!canFlat}
              className={`btn btn-sm flex-1 ${
                !topStuds && activePartId ? "ff-btn-primary" : "btn-ghost"
              }`}
              onClick={() =>
                applyPart(family, activeSize, false, sizeMode)
              }
            >
              Flat
            </button>
          </div>
          <p className="text-[11px] leading-snug text-[var(--ff-muted)]">
            Flat = no top connector; can still snap onto studs below.
          </p>
        </section>
      </div>
    </aside>
  );
}

function ShapeGlyph({
  family,
  active,
}: {
  family: PartFamily;
  active: boolean;
}) {
  const fill = active ? "var(--ff-accent)" : "var(--ff-muted)";
  if (family === "round" || family === "round-plate") {
    return (
      <span
        className={`block rounded-full border border-black/10 ${
          family === "round-plate" ? "h-3 w-6" : "h-5 w-5"
        }`}
        style={{ background: fill, opacity: active ? 1 : 0.55 }}
      />
    );
  }
  return (
    <span
      className={`block rounded-sm border border-black/10 ${
        family === "plate" ? "h-2.5 w-7" : "h-5 w-6"
      }`}
      style={{ background: fill, opacity: active ? 1 : 0.55 }}
    />
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
  const unit = 18 / max;
  const w = Math.max(8, size.w * unit);
  const h = Math.max(8, size.d * unit);
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      <span
        className={`border border-black/15 shadow-inner ${
          round ? "rounded-full" : "rounded-sm"
        }`}
        style={{
          width: w,
          height: round ? w : h,
          background: color ?? "var(--ff-border)",
        }}
      />
    </span>
  );
}
