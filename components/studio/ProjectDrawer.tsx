"use client";

import {
  Add,
  Close,
  DocumentExport,
  DocumentImport,
  Edit,
  Folder,
  TrashCan,
} from "@carbon/icons-react";
import { useEffect, useState } from "react";
import {
  deleteProject,
  listProjects,
  renameProject,
  saveProject,
} from "@/lib/db";
import { confirmDialog } from "@/store/dialogStore";
import { createBlankProject, useEditorStore } from "@/store/editorStore";
import type { Project } from "@/types/project";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoaded: () => void;
  onExportFile?: () => void;
  onImportFile?: () => void;
};

export function ProjectDrawer({
  open,
  onClose,
  onLoaded,
  onExportFile,
  onImportFile,
}: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const hydrateProject = useEditorStore((s) => s.hydrateProject);
  const projectId = useEditorStore((s) => s.projectId);
  const getScene = useEditorStore((s) => s.getScene);
  const projectName = useEditorStore((s) => s.projectName);
  const markClean = useEditorStore((s) => s.markClean);

  const refresh = async () => {
    setProjects(await listProjects());
  };

  useEffect(() => {
    if (open) void refresh();
  }, [open]);

  if (!open) return null;

  const persistCurrent = async () => {
    const id = useEditorStore.getState().projectId;
    if (!id) return;
    const now = Date.now();
    await saveProject({
      id,
      name: projectName,
      createdAt:
        projects.find((p) => p.id === id)?.createdAt ?? now,
      updatedAt: now,
      scene: getScene(),
    });
    markClean();
  };

  const handleNew = async () => {
    await persistCurrent();
    const project = createBlankProject(`Figure ${projects.length + 1}`);
    await saveProject(project);
    hydrateProject(project);
    onLoaded();
    onClose();
  };

  const handleOpen = async (project: Project) => {
    if (project.id === projectId) {
      onClose();
      return;
    }
    await persistCurrent();
    hydrateProject(project);
    onLoaded();
    onClose();
  };

  const handleDelete = async (project: Project) => {
    const ok = await confirmDialog(
      "Delete project?",
      `“${project.name}” will be removed from this browser. This cannot be undone.`,
      { confirmLabel: "Delete", cancelLabel: "Keep" },
    );
    if (!ok) return;
    await deleteProject(project.id);
    if (project.id === projectId) {
      const remaining = (await listProjects()).filter((p) => p.id !== project.id);
      if (remaining[0]) {
        hydrateProject(remaining[0]);
      } else {
        const blank = createBlankProject();
        await saveProject(blank);
        hydrateProject(blank);
      }
      onLoaded();
    }
    await refresh();
  };

  const commitRename = async () => {
    if (!renameId || !renameValue.trim()) {
      setRenameId(null);
      return;
    }
    await renameProject(renameId, renameValue.trim());
    if (renameId === projectId) {
      useEditorStore.getState().setProjectName(renameValue.trim());
      useEditorStore.getState().markClean();
    }
    setRenameId(null);
    await refresh();
  };

  return (
    <dialog className="modal modal-open" open>
      <div className="modal-box max-w-lg border border-[var(--ff-border)] bg-[var(--ff-panel)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
              Local vault
            </p>
            <h3 className="font-display flex items-center gap-2 text-xl font-bold">
              <Folder size={20} className="ff-icon text-[var(--ff-accent)]" />
              Projects
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-sm ff-btn-primary gap-1.5"
            onClick={handleNew}
          >
            <Add size={16} className="ff-icon" />
            New figure
          </button>
        </div>

        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {projects.map((p) => (
            <li
              key={p.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                p.id === projectId
                  ? "border-[var(--ff-accent)] bg-[var(--ff-panel-2)]"
                  : "border-[var(--ff-border)]"
              }`}
            >
              {renameId === p.id ? (
                <input
                  className="input input-sm flex-1 border-[var(--ff-border)] bg-[var(--ff-bg)]"
                  value={renameValue}
                  autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => void commitRename()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void commitRename();
                    if (e.key === "Escape") setRenameId(null);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="flex-1 truncate text-left text-sm font-medium"
                  onClick={() => void handleOpen(p)}
                >
                  {p.name}
                  <span className="mt-0.5 block text-[11px] font-normal text-[var(--ff-muted)]">
                    {new Date(p.updatedAt).toLocaleString()} · {p.scene.bricks.length} bricks
                  </span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1"
                title="Rename"
                aria-label={`Rename ${p.name}`}
                onClick={() => {
                  setRenameId(p.id);
                  setRenameValue(p.name);
                }}
              >
                <Edit size={16} className="ff-icon" />
                <span className="hidden sm:inline">Rename</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1 text-[var(--ff-danger)]"
                title="Delete"
                aria-label={`Delete ${p.name}`}
                onClick={() => void handleDelete(p)}
              >
                <TrashCan size={16} className="ff-icon" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="py-8 text-center text-sm text-[var(--ff-muted)]">
              No projects yet. Create one to start building.
            </li>
          )}
        </ul>

        <p className="mt-4 text-xs text-[var(--ff-muted)]">
          No account needed. Projects stay in this browser — or move them with a
          portable <span className="font-mono">.frontfigure.json</span> file.
        </p>

        <div className="modal-action flex-wrap gap-2">
          {onImportFile && (
            <button
              type="button"
              className="btn btn-sm btn-outline gap-1.5 border-[var(--ff-border)]"
              onClick={onImportFile}
            >
              <DocumentImport size={16} className="ff-icon" />
              Import file
            </button>
          )}
          {onExportFile && (
            <button
              type="button"
              className="btn btn-sm btn-outline gap-1.5 border-[var(--ff-border)]"
              onClick={onExportFile}
            >
              <DocumentExport size={16} className="ff-icon" />
              Export file
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost gap-1.5"
            onClick={onClose}
          >
            <Close size={16} className="ff-icon" />
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
