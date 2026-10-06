"use client";

import { AddAlt, Copy, Cursor_1, FitToScreen } from "@carbon/icons-react";
import { useEditorStore } from "@/store/editorStore";

export function ToolStrip() {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const setActivePart = useEditorStore((s) => s.setActivePart);
  const placeFlash = useEditorStore((s) => s.placeFlash);
  const selectionIds = useEditorStore((s) => s.selectionIds);
  const hasSelection = selectionIds.length > 0;
  const duplicateSelection = useEditorStore((s) => s.duplicateSelection);
  const frameCamera = useEditorStore((s) => s.frameCamera);

  return (
    <div className="ff-hud-panel pointer-events-auto relative flex items-center gap-2 rounded-xl px-3 py-2">
      {placeFlash && (
        <div className="ff-place-flash absolute inset-0 rounded-xl bg-[var(--ff-accent)]" />
      )}
      <button
        type="button"
        className={`btn btn-sm gap-1.5 ${tool === "select" ? "ff-btn-primary" : "btn-ghost"}`}
        onClick={() => {
          setActivePart(null);
          setTool("select");
        }}
      >
        <Cursor_1 size={16} className="ff-icon" />
        Select
      </button>
      <button
        type="button"
        className={`btn btn-sm gap-1.5 ${tool === "place" ? "ff-btn-primary" : "btn-ghost"}`}
        onClick={() => setTool("place")}
      >
        <AddAlt size={16} className="ff-icon" />
        Place
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost gap-1.5"
        disabled={!hasSelection}
        onClick={duplicateSelection}
        title="Duplicate — place a copy (Ctrl+D)"
      >
        <Copy size={16} className="ff-icon" />
        Duplicate
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost gap-1.5"
        onClick={() => frameCamera(hasSelection)}
        title="Frame (F)"
      >
        <FitToScreen size={16} className="ff-icon" />
        Frame
      </button>
      <span className="ml-2 hidden text-xs text-[var(--ff-muted)] lg:inline">
        Esc · R · Del · Shift+click · Ctrl+D · F · Ctrl+Z
      </span>
    </div>
  );
}
