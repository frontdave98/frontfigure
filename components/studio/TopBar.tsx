"use client";

import {
  Cube,
  DocumentExport,
  DocumentImport,
  Export,
  FitToScreen,
  List,
  Redo,
  Reset,
  Save,
  Undo,
} from "@carbon/icons-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEditorStore } from "@/store/editorStore";

type Props = {
  onOpenProjects: () => void;
  onSave: () => void;
  onExportGlb: () => void;
  onExportFile: () => void;
  onImportFile: () => void;
  onToggleBom: () => void;
  bomOpen: boolean;
};

export function TopBar({
  onOpenProjects,
  onSave,
  onExportGlb,
  onExportFile,
  onImportFile,
  onToggleBom,
  bomOpen,
}: Props) {
  const projectName = useEditorStore((s) => s.projectName);
  const dirty = useEditorStore((s) => s.dirty);
  const saving = useEditorStore((s) => s.saving);
  const savePulse = useEditorStore((s) => s.savePulse);
  const brickCount = useEditorStore((s) => s.bricks.length);
  const resetCamera = useEditorStore((s) => s.resetCamera);
  const frameCamera = useEditorStore((s) => s.frameCamera);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);

  return (
    <header className="ff-hud-panel pointer-events-auto relative z-20 flex items-center gap-3 rounded-xl px-3 py-2">
      <Link href="/" className="hover:brightness-110">
        <BrandLockup size="sm" />
      </Link>
      <div className="h-5 w-px bg-[var(--ff-border)]" />
      <button
        type="button"
        className="btn btn-ghost btn-sm max-w-[180px] truncate px-2 font-medium"
        onClick={onOpenProjects}
        title="Projects"
      >
        {projectName}
        {dirty ? <span className="text-[var(--ff-accent)]"> •</span> : null}
      </button>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
        <span className="mr-1 hidden text-xs text-[var(--ff-muted)] xl:inline">
          {brickCount} bricks
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5"
          disabled={past.length === 0}
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} className="ff-icon" />
          <span className="hidden sm:inline">Undo</span>
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5"
          disabled={future.length === 0}
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} className="ff-icon" />
          <span className="hidden sm:inline">Redo</span>
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5"
          onClick={() => frameCamera(false)}
          title="Frame all (F)"
        >
          <FitToScreen size={16} className="ff-icon" />
          <span className="hidden sm:inline">Frame</span>
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5"
          onClick={resetCamera}
          title="Reset camera"
        >
          <Reset size={16} className="ff-icon" />
          <span className="hidden lg:inline">Reset</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm gap-1.5 ${bomOpen ? "ff-btn-primary" : "btn-ghost"}`}
          onClick={onToggleBom}
          title="Parts list"
        >
          <List size={16} className="ff-icon" />
          <span className="hidden sm:inline">BOM</span>
        </button>
        <ThemeToggle />
        <button
          type="button"
          className={`btn btn-sm ff-btn-primary gap-1.5 ${savePulse ? "ff-save-pulse" : ""}`}
          onClick={onSave}
          disabled={saving}
        >
          <Save size={16} className="ff-icon" />
          {saving ? "Saving…" : "Save"}
        </button>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-sm btn-outline gap-1.5 border-[var(--ff-border)]"
          >
            <Export size={16} className="ff-icon" />
            Export
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-50 mt-2 w-56 rounded-box border border-[var(--ff-border)] bg-[var(--ff-panel)] p-2 shadow-lg"
          >
            <li>
              <button type="button" className="gap-2" onClick={onExportGlb}>
                <Cube size={16} className="ff-icon" />
                Export GLB
              </button>
            </li>
            <li>
              <button type="button" className="gap-2" onClick={onExportFile}>
                <DocumentExport size={16} className="ff-icon" />
                Export project file
              </button>
            </li>
            <li>
              <button type="button" className="gap-2" onClick={onImportFile}>
                <DocumentImport size={16} className="ff-icon" />
                Import project file
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
