"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProject, listProjects, saveProject } from "@/lib/db";
import { exportSceneToGlb } from "@/lib/export/glb";
import {
  downloadProjectFile,
  parseProjectFile,
} from "@/lib/projectFile";
import { alertDialog } from "@/store/dialogStore";
import { createBlankProject, useEditorStore } from "@/store/editorStore";
import { BomPanel } from "./BomPanel";
import { Inspector } from "./Inspector";
import { Palette } from "./Palette";
import { ProjectDrawer } from "./ProjectDrawer";
import { ToolStrip } from "./ToolStrip";
import { TopBar } from "./TopBar";

const StudioCanvas = dynamic(
  () =>
    import("./viewport/StudioCanvas").then((m) => m.StudioCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[var(--ff-bg-deep)] text-sm text-[var(--ff-muted)]">
        Booting viewport…
      </div>
    ),
  },
);

export function StudioShell() {
  const [ready, setReady] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [bomOpen, setBomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrateProject = useEditorStore((s) => s.hydrateProject);
  const dirty = useEditorStore((s) => s.dirty);
  const bricks = useEditorStore((s) => s.bricks);
  const projectName = useEditorStore((s) => s.projectName);
  const setSaving = useEditorStore((s) => s.setSaving);
  const markClean = useEditorStore((s) => s.markClean);
  const triggerSavePulse = useEditorStore((s) => s.triggerSavePulse);
  const getScene = useEditorStore((s) => s.getScene);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteSelection = useEditorStore((s) => s.deleteSelection);
  const duplicateSelection = useEditorStore((s) => s.duplicateSelection);
  const rotateSelection = useEditorStore((s) => s.rotateSelection);
  const frameCamera = useEditorStore((s) => s.frameCamera);
  const setActivePart = useEditorStore((s) => s.setActivePart);
  const setTool = useEditorStore((s) => s.setTool);

  const boot = useCallback(async () => {
    const existing = await listProjects();
    if (existing[0]) {
      const fresh = (await getProject(existing[0].id)) ?? existing[0];
      hydrateProject(fresh);
    } else {
      const project = createBlankProject();
      await saveProject(project);
      hydrateProject(project);
    }
    setReady(true);
  }, [hydrateProject]);

  useEffect(() => {
    void boot();
  }, [boot]);

  const persist = useCallback(async () => {
    const state = useEditorStore.getState();
    if (!state.projectId) return;
    setSaving(true);
    try {
      const now = Date.now();
      const list = await listProjects();
      const createdAt =
        list.find((p) => p.id === state.projectId)?.createdAt ?? now;
      await saveProject({
        id: state.projectId,
        name: state.projectName,
        createdAt,
        updatedAt: now,
        scene: state.getScene(),
      });
      markClean();
      triggerSavePulse();
    } finally {
      setSaving(false);
    }
  }, [markClean, setSaving, triggerSavePulse]);

  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!ready || !dirty) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void persist();
    }, 500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [bricks, projectName, dirty, ready, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection();
        return;
      }
      if (e.key === "Escape") {
        setActivePart(null);
        setTool("select");
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (e.key.toLowerCase() === "r") {
        rotateSelection();
        return;
      }
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        const hasSelection =
          useEditorStore.getState().selectionIds.length > 0;
        frameCamera(hasSelection);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    undo,
    redo,
    persist,
    deleteSelection,
    duplicateSelection,
    rotateSelection,
    frameCamera,
    setActivePart,
    setTool,
  ]);

  const handleExportGlb = async () => {
    const scene = getScene();
    if (scene.bricks.length === 0) {
      await alertDialog(
        "Nothing to export",
        "Place at least one brick before exporting a GLB.",
      );
      return;
    }
    try {
      const name = useEditorStore
        .getState()
        .projectName.replace(/[^\w\-]+/g, "_")
        .toLowerCase();
      await exportSceneToGlb(scene, `${name || "frontfigure"}.glb`);
    } catch (err) {
      await alertDialog(
        "Export failed",
        err instanceof Error ? err.message : "Could not export GLB.",
      );
    }
  };

  const handleExportFile = async () => {
    await persist();
    const state = useEditorStore.getState();
    if (!state.projectId) return;
    const list = await listProjects();
    const createdAt =
      list.find((p) => p.id === state.projectId)?.createdAt ?? Date.now();
    downloadProjectFile({
      id: state.projectId,
      name: state.projectName,
      createdAt,
      updatedAt: Date.now(),
      scene: state.getScene(),
    });
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return;
    try {
      const payload = await parseProjectFile(file);
      const imported = {
        ...payload.project,
        id: crypto.randomUUID(),
        updatedAt: Date.now(),
      };
      await persist();
      await saveProject(imported);
      hydrateProject(imported);
      triggerSavePulse();
    } catch (err) {
      await alertDialog(
        "Import failed",
        err instanceof Error ? err.message : "Could not import project file.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--ff-bg)] text-[var(--ff-muted)]">
        Loading studio…
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[var(--ff-bg-deep)]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => void onFileChosen(e.target.files?.[0])}
      />
      <div className="absolute inset-0">
        <StudioCanvas />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 p-3">
        <TopBar
          onOpenProjects={() => setProjectsOpen(true)}
          onSave={() => void persist()}
          onExportGlb={() => void handleExportGlb()}
          onExportFile={() => void handleExportFile()}
          onImportFile={handleImportFile}
          onToggleBom={() => setBomOpen((v) => !v)}
          bomOpen={bomOpen}
        />
        <div className="flex min-h-0 flex-1 gap-3">
          <Palette />
          <div className="flex min-w-0 flex-1 flex-col justify-end">
            <div className="self-center">
              <ToolStrip />
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-3">
            <div className={`min-h-0 ${bomOpen ? "flex-[1.2]" : "flex-1"}`}>
              <Inspector />
            </div>
            <BomPanel open={bomOpen} onClose={() => setBomOpen(false)} />
          </div>
        </div>
      </div>

      <ProjectDrawer
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        onLoaded={() => undefined}
        onExportFile={() => void handleExportFile()}
        onImportFile={handleImportFile}
      />
    </div>
  );
}
