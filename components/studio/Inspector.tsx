"use client";

import {
  ColorPalette,
  RotateClockwise,
  Save,
  TrashCan,
} from "@carbon/icons-react";
import { useEffect, useState } from "react";
import { BRICK_CATALOG, COLOR_PRESETS, getPart } from "@/lib/bricks/catalog";
import { resolveFinish } from "@/lib/bricks/material";
import {
  addSavedColor,
  listSavedColors,
  removeSavedColor,
} from "@/lib/savedColors";
import { useEditorStore } from "@/store/editorStore";
import type { BrickFinish } from "@/types/project";

function unanimous<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  const first = values[0];
  return values.every((v) => v === first) ? first : null;
}

export function Inspector() {
  const selectionIds = useEditorStore((s) => s.selectionIds);
  const bricks = useEditorStore((s) => s.bricks);
  const placeColor = useEditorStore((s) => s.placeColor);
  const placeFinish = useEditorStore((s) => s.placeFinish);
  const placeRotation = useEditorStore((s) => s.placeRotation);
  const activePartId = useEditorStore((s) => s.activePartId);
  const tool = useEditorStore((s) => s.tool);
  const setSelectionColor = useEditorStore((s) => s.setSelectionColor);
  const setSelectionFinish = useEditorStore((s) => s.setSelectionFinish);
  const setSelectionPart = useEditorStore((s) => s.setSelectionPart);
  const setPlaceColor = useEditorStore((s) => s.setPlaceColor);
  const setPlaceFinish = useEditorStore((s) => s.setPlaceFinish);
  const setPlaceRotation = useEditorStore((s) => s.setPlaceRotation);
  const deleteSelection = useEditorStore((s) => s.deleteSelection);
  const rotateSelection = useEditorStore((s) => s.rotateSelection);

  const idSet = new Set(selectionIds);
  const selected =
    selectionIds.length === 0
      ? []
      : bricks.filter((b) => idSet.has(b.instanceId));

  const hasSelection = selected.length > 0;
  const sharedPartId = unanimous(selected.map((b) => b.partId));
  const sharedColor = unanimous(
    selected.map((b) => b.color.toLowerCase()),
  );
  const sharedFinish = unanimous(
    selected.map((b) => resolveFinish(b.finish)),
  );
  const sharedRotation = unanimous(selected.map((b) => b.rotationY));

  const color = hasSelection
    ? sharedColor
      ? selected[0].color
      : ""
    : placeColor;
  const colorMixed = hasSelection && sharedColor === null;
  const finish: BrickFinish | null = hasSelection
    ? sharedFinish
    : placeFinish;
  const finishMixed = hasSelection && sharedFinish === null;
  const partId = hasSelection ? sharedPartId : activePartId;
  const part = partId ? getPart(partId) : undefined;
  const rotationMixed = hasSelection && sharedRotation === null;
  const rotation = hasSelection
    ? (sharedRotation ?? placeRotation)
    : placeRotation;

  const [hexDraft, setHexDraft] = useState(
    color ? color.replace("#", "") : "",
  );
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setHexDraft(color ? color.replace("#", "") : "");
  }, [color, selectionIds]);

  useEffect(() => {
    setSaved(listSavedColors());
  }, []);

  const applyColor = (hex: string) => {
    if (hasSelection) setSelectionColor(hex);
    else setPlaceColor(hex);
  };

  const applyFinish = (next: BrickFinish) => {
    if (hasSelection) setSelectionFinish(next);
    else setPlaceFinish(next);
  };

  const handleSaveColor = () => {
    if (!color) return;
    const next = addSavedColor(color);
    setSaved(next);
  };

  const handleRemoveSaved = (hex: string) => {
    setSaved(removeSavedColor(hex));
  };

  const pickerValue =
    color && /^#[0-9a-fA-F]{6}$/.test(color)
      ? color
      : `#${hexDraft.padEnd(6, "0") || "FFFFFF"}`;

  const title = hasSelection
    ? selected.length === 1
      ? "Selection"
      : `${selected.length} selected`
    : tool === "place"
      ? "Place mode"
      : "No selection";

  const subtitle = hasSelection
    ? selected.length === 1
      ? (part?.label ?? selected[0].partId)
      : sharedPartId
        ? `${part?.label ?? sharedPartId} · ${selected.length} bricks`
        : "Mixed parts — color & finish only"
    : tool === "place"
      ? "Click the grid to drop a brick"
      : "Select a brick or pick a part · Shift+click to multi-select";

  return (
    <aside className="ff-hud-panel pointer-events-auto flex h-full max-h-full w-64 flex-col gap-4 overflow-y-auto rounded-xl p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
          Inspect
        </p>
        <h2 className="font-display text-lg font-bold leading-tight">
          {title}
        </h2>
        <p className="mt-1 text-xs text-[var(--ff-muted)]">{subtitle}</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
          <ColorPalette size={14} className="ff-icon" />
          Color
          {colorMixed && (
            <span className="normal-case tracking-normal text-[var(--ff-accent)]">
              · Mixed
            </span>
          )}
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              className={`h-8 w-full rounded-md border-2 transition ${
                !colorMixed && color.toLowerCase() === c.toLowerCase()
                  ? "border-[var(--ff-accent)] scale-105"
                  : "border-[var(--ff-border)]"
              }`}
              style={{ background: c }}
              onClick={() => applyColor(c)}
            />
          ))}
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Saved
          </p>
          {saved.length === 0 ? (
            <p className="text-xs text-[var(--ff-muted)]">No saved colors yet</p>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {saved.map((c) => (
                <div key={c} className="group relative">
                  <button
                    type="button"
                    title={c}
                    className={`h-8 w-full rounded-md border-2 transition ${
                      !colorMixed && color.toLowerCase() === c.toLowerCase()
                        ? "border-[var(--ff-accent)] scale-105"
                        : "border-[var(--ff-border)]"
                    }`}
                    style={{ background: c }}
                    onClick={() => applyColor(c)}
                  />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-[var(--ff-danger)] text-[10px] font-bold leading-none text-white group-hover:flex"
                    title="Remove saved color"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSaved(c);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Color picker"
            className="h-9 w-11 cursor-pointer rounded-md border border-[var(--ff-border)] bg-[var(--ff-panel-2)] p-0.5"
            value={pickerValue.length === 7 ? pickerValue : "#FFFFFF"}
            onChange={(e) => {
              const hex = e.target.value.toUpperCase();
              setHexDraft(hex.replace("#", ""));
              applyColor(hex);
            }}
          />
          <label className="input input-sm flex min-w-0 flex-1 items-center gap-2 border-[var(--ff-border)] bg-[var(--ff-panel-2)]">
            <span className="text-[var(--ff-muted)]">#</span>
            <input
              type="text"
              className="grow bg-transparent text-sm uppercase"
              placeholder={colorMixed ? "Mixed" : undefined}
              value={hexDraft}
              onChange={(e) => {
                const raw = e.target.value
                  .replace(/[^0-9a-fA-F]/g, "")
                  .slice(0, 6);
                setHexDraft(raw);
                if (raw.length === 6) applyColor(`#${raw.toUpperCase()}`);
              }}
            />
          </label>
          <button
            type="button"
            className="btn btn-sm ff-btn-primary shrink-0 gap-1 px-2"
            onClick={handleSaveColor}
            disabled={!color}
            title="Save color to palette"
          >
            <Save size={16} className="ff-icon" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
          Finish
          {finishMixed && (
            <span className="ml-1.5 normal-case tracking-normal text-[var(--ff-accent)]">
              · Mixed
            </span>
          )}
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            className={`btn btn-sm flex-1 ${
              finish === "opaque" ? "ff-btn-primary" : "btn-ghost"
            }`}
            onClick={() => applyFinish("opaque")}
          >
            Solid
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-1 ${
              finish === "glass" ? "ff-btn-primary" : "btn-ghost"
            }`}
            onClick={() => applyFinish("glass")}
          >
            Glass
          </button>
        </div>
        <p className="text-[11px] leading-snug text-[var(--ff-muted)]">
          Glass is translucent like tinted acrylic — great for windows and visors.
        </p>
      </div>

      {hasSelection && sharedPartId && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Part / size
          </label>
          <select
            className="select select-sm w-full border-[var(--ff-border)] bg-[var(--ff-panel-2)]"
            value={sharedPartId}
            onChange={(e) => setSelectionPart(e.target.value)}
          >
            {BRICK_CATALOG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasSelection && !sharedPartId && (
        <p className="rounded-md border border-[var(--ff-border)] bg-[var(--ff-panel-2)] px-2 py-1.5 text-[11px] leading-snug text-[var(--ff-muted)]">
          Mixed parts — color &amp; finish only. Part size stays per brick.
        </p>
      )}

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
          Rotation Y
          {rotationMixed && (
            <span className="ml-1.5 normal-case tracking-normal text-[var(--ff-accent)]">
              · Mixed
            </span>
          )}
        </label>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm">
            {rotationMixed ? "Mixed" : `${rotation}°`}
          </span>
          <button
            type="button"
            className="btn btn-sm ff-btn-primary gap-1.5"
            onClick={() => {
              if (hasSelection) rotateSelection();
              else {
                const order = [0, 90, 180, 270] as const;
                const i = order.indexOf(placeRotation);
                setPlaceRotation(order[(i + 1) % 4]);
              }
            }}
          >
            <RotateClockwise size={16} className="ff-icon" />
            Rotate 90°
          </button>
        </div>
      </div>

      {hasSelection && (
        <button
          type="button"
          className="btn btn-sm ff-btn-danger mt-auto gap-1.5"
          onClick={deleteSelection}
        >
          <TrashCan size={16} className="ff-icon" />
          {selected.length === 1
            ? "Delete brick"
            : `Delete ${selected.length} bricks`}
        </button>
      )}
    </aside>
  );
}
