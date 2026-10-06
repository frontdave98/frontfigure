"use client";

import { create } from "zustand";
import { cameraForBounds, computeBricksBounds } from "@/lib/bricks/bounds";
import { getPart } from "@/lib/bricks/catalog";
import { resolveFinish } from "@/lib/bricks/material";
import { resnapBrick } from "@/lib/bricks/placement";
import { nextRotation } from "@/lib/bricks/units";
import { alertDialog } from "@/store/dialogStore";
import type {
  BrickFinish,
  CameraState,
  PlacedBrick,
  Project,
  RotationY,
  Scene,
  ToolMode,
  Vec3,
} from "@/types/project";
import {
  BRICK_SOFT_LIMIT,
  DEFAULT_CAMERA,
  emptyScene,
} from "@/types/project";

const HISTORY_CAP = 50;

type SelectOpts = { additive?: boolean };

type EditorState = {
  projectId: string | null;
  projectName: string;
  bricks: PlacedBrick[];
  camera: CameraState;
  selectionIds: string[];
  tool: ToolMode;
  activePartId: string | null;
  placeColor: string;
  placeFinish: BrickFinish;
  placeRotation: RotationY;
  dirty: boolean;
  saving: boolean;
  savePulse: boolean;
  placeFlash: boolean;
  cameraResetToken: number;
  past: PlacedBrick[][];
  future: PlacedBrick[][];

  hydrateProject: (project: Project) => void;
  setProjectMeta: (id: string, name: string) => void;
  setProjectName: (name: string) => void;
  markClean: () => void;
  setSaving: (v: boolean) => void;
  triggerSavePulse: () => void;
  triggerPlaceFlash: () => void;
  resetCamera: () => void;
  setCamera: (camera: CameraState) => void;

  setTool: (tool: ToolMode) => void;
  setActivePart: (partId: string | null) => void;
  setPlaceColor: (color: string) => void;
  setPlaceFinish: (finish: BrickFinish) => void;
  setPlaceRotation: (r: RotationY) => void;
  selectBrick: (id: string | null, opts?: SelectOpts) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  placeBrick: (position: Vec3) => boolean;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  rotateSelection: () => void;
  setSelectionColor: (color: string) => void;
  setSelectionFinish: (finish: BrickFinish) => void;
  setSelectionPart: (partId: string) => void;
  frameCamera: (selectionOnly?: boolean) => void;

  getScene: () => Scene;
};

function newId() {
  return crypto.randomUUID();
}

function selectedFrom(
  bricks: PlacedBrick[],
  selectionIds: string[],
): PlacedBrick[] {
  if (selectionIds.length === 0) return [];
  const idSet = new Set(selectionIds);
  return bricks.filter((b) => idSet.has(b.instanceId));
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: "Untitled Figure",
  bricks: [],
  camera: { ...DEFAULT_CAMERA },
  selectionIds: [],
  tool: "select",
  activePartId: null,
  placeColor: "#C41E3A",
  placeFinish: "opaque",
  placeRotation: 0,
  dirty: false,
  saving: false,
  savePulse: false,
  placeFlash: false,
  cameraResetToken: 0,
  past: [],
  future: [],

  hydrateProject: (project) => {
    set({
      projectId: project.id,
      projectName: project.name,
      bricks: project.scene.bricks,
      camera: project.scene.camera ?? { ...DEFAULT_CAMERA },
      selectionIds: [],
      tool: "select",
      activePartId: null,
      dirty: false,
      past: [],
      future: [],
    });
  },

  setProjectMeta: (id, name) => set({ projectId: id, projectName: name }),
  setProjectName: (name) => set({ projectName: name, dirty: true }),
  markClean: () => set({ dirty: false }),
  setSaving: (v) => set({ saving: v }),
  triggerSavePulse: () => {
    set({ savePulse: true });
    window.setTimeout(() => set({ savePulse: false }), 600);
  },
  triggerPlaceFlash: () => {
    set({ placeFlash: true });
    window.setTimeout(() => set({ placeFlash: false }), 220);
  },
  resetCamera: () =>
    set((s) => ({
      camera: { ...DEFAULT_CAMERA },
      cameraResetToken: s.cameraResetToken + 1,
    })),
  setCamera: (camera) => set({ camera }),

  setTool: (tool) =>
    set({
      tool,
      selectionIds: tool === "place" ? [] : get().selectionIds,
    }),
  setActivePart: (partId) => {
    if (!partId) {
      set({ activePartId: null, tool: "select" });
      return;
    }
    const part = getPart(partId);
    set({
      activePartId: partId,
      tool: "place",
      placeColor: part?.colorDefault ?? get().placeColor,
      selectionIds: [],
    });
  },
  setPlaceColor: (color) => set({ placeColor: color }),
  setPlaceFinish: (finish) => set({ placeFinish: finish }),
  setPlaceRotation: (r) => set({ placeRotation: r }),
  selectBrick: (id, opts) => {
    if (id === null) {
      set({ selectionIds: [], tool: "select", activePartId: null });
      return;
    }
    if (opts?.additive) {
      const current = get().selectionIds;
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      set({ selectionIds: next, tool: "select", activePartId: null });
      return;
    }
    set({ selectionIds: [id], tool: "select", activePartId: null });
  },

  pushHistory: () => {
    const { bricks, past } = get();
    const next = [...past, bricks.map((b) => ({ ...b, position: { ...b.position } }))];
    if (next.length > HISTORY_CAP) next.shift();
    set({ past: next, future: [] });
  },

  undo: () => {
    const { past, bricks, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [bricks, ...future].slice(0, HISTORY_CAP),
      bricks: prev,
      selectionIds: [],
      dirty: true,
    });
  },

  redo: () => {
    const { future, bricks, past } = get();
    if (future.length === 0) return;
    const [next, ...rest] = future;
    set({
      future: rest,
      past: [...past, bricks].slice(-HISTORY_CAP),
      bricks: next,
      selectionIds: [],
      dirty: true,
    });
  },

  placeBrick: (position) => {
    const { activePartId, placeColor, placeFinish, placeRotation, bricks } =
      get();
    if (!activePartId) return false;
    if (bricks.length >= BRICK_SOFT_LIMIT) {
      void alertDialog(
        "Brick limit reached",
        `This studio soft-limits figures to ${BRICK_SOFT_LIMIT} bricks for performance. Remove some bricks to continue.`,
      );
      return false;
    }
    if (bricks.length === BRICK_SOFT_LIMIT - 1) {
      void alertDialog(
        "Almost at the limit",
        `You are about to place brick ${BRICK_SOFT_LIMIT}. Further placements will be blocked until some are removed.`,
      );
    }
    get().pushHistory();
    const brick: PlacedBrick = {
      instanceId: newId(),
      partId: activePartId,
      color: placeColor,
      finish: placeFinish,
      position: { ...position },
      rotationY: placeRotation,
    };
    set({
      bricks: [...bricks, brick],
      selectionIds: [brick.instanceId],
      dirty: true,
    });
    get().triggerPlaceFlash();
    return true;
  },

  deleteSelection: () => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0) return;
    const idSet = new Set(selectionIds);
    get().pushHistory();
    set({
      bricks: bricks.filter((b) => !idSet.has(b.instanceId)),
      selectionIds: [],
      dirty: true,
    });
  },

  duplicateSelection: () => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0) return;
    const sourceId = selectionIds[selectionIds.length - 1];
    const source = bricks.find((b) => b.instanceId === sourceId);
    if (!source) return;
    set({
      tool: "place",
      activePartId: source.partId,
      placeColor: source.color,
      placeFinish: resolveFinish(source.finish),
      placeRotation: source.rotationY,
      selectionIds: [],
    });
  },

  frameCamera: (selectionOnly = false) => {
    const { bricks, selectionIds } = get();
    const focus =
      selectionOnly && selectionIds.length > 0
        ? selectedFrom(bricks, selectionIds)
        : bricks;
    const bounds = computeBricksBounds(focus.length ? focus : bricks);
    if (!bounds) {
      get().resetCamera();
      return;
    }
    set((s) => ({
      camera: cameraForBounds(bounds),
      cameraResetToken: s.cameraResetToken + 1,
    }));
  },

  rotateSelection: () => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0) {
      set({ placeRotation: nextRotation(get().placeRotation) });
      return;
    }
    const idSet = new Set(selectionIds);
    get().pushHistory();
    set({
      bricks: bricks.map((b) => {
        if (!idSet.has(b.instanceId)) return b;
        const rotationY = nextRotation(b.rotationY);
        const position = resnapBrick(b, bricks, { rotationY });
        return { ...b, rotationY, position };
      }),
      dirty: true,
    });
  },

  setSelectionColor: (color) => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0) {
      set({ placeColor: color });
      return;
    }
    const idSet = new Set(selectionIds);
    get().pushHistory();
    set({
      bricks: bricks.map((b) =>
        idSet.has(b.instanceId) ? { ...b, color } : b,
      ),
      dirty: true,
    });
  },

  setSelectionFinish: (finish) => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0) {
      set({ placeFinish: finish });
      return;
    }
    const idSet = new Set(selectionIds);
    get().pushHistory();
    set({
      bricks: bricks.map((b) =>
        idSet.has(b.instanceId) ? { ...b, finish } : b,
      ),
      dirty: true,
    });
  },

  setSelectionPart: (partId) => {
    const { selectionIds, bricks } = get();
    if (selectionIds.length === 0 || !getPart(partId)) return;
    const selected = selectedFrom(bricks, selectionIds);
    if (selected.length === 0) return;
    const sharedPart = selected[0].partId;
    if (!selected.every((b) => b.partId === sharedPart)) return;
    if (sharedPart === partId) return;
    const idSet = new Set(selectionIds);
    get().pushHistory();
    set({
      bricks: bricks.map((b) => {
        if (!idSet.has(b.instanceId)) return b;
        const position = resnapBrick(b, bricks, { partId });
        return { ...b, partId, position };
      }),
      dirty: true,
    });
  },

  getScene: () => {
    const { bricks, camera } = get();
    return { bricks, camera };
  },
}));

export function createBlankProject(name = "Untitled Figure"): Project {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    scene: emptyScene(),
  };
}
