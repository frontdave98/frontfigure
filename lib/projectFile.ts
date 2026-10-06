import type { Project, Scene } from "@/types/project";

export const PROJECT_FILE_VERSION = 1;

export type ProjectFilePayload = {
  version: number;
  project: Project;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isScene(v: unknown): v is Scene {
  if (!isRecord(v) || !Array.isArray(v.bricks)) return false;
  return v.bricks.every((b) => {
    if (!isRecord(b)) return false;
    return (
      typeof b.instanceId === "string" &&
      typeof b.partId === "string" &&
      typeof b.color === "string" &&
      isRecord(b.position) &&
      typeof b.position.x === "number" &&
      typeof b.position.y === "number" &&
      typeof b.position.z === "number" &&
      (b.rotationY === 0 ||
        b.rotationY === 90 ||
        b.rotationY === 180 ||
        b.rotationY === 270)
    );
  });
}

export function isProjectFilePayload(v: unknown): v is ProjectFilePayload {
  if (!isRecord(v)) return false;
  if (typeof v.version !== "number") return false;
  if (!isRecord(v.project)) return false;
  const p = v.project;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.createdAt === "number" &&
    typeof p.updatedAt === "number" &&
    isScene(p.scene)
  );
}

export function buildProjectFile(project: Project): ProjectFilePayload {
  return {
    version: PROJECT_FILE_VERSION,
    project: {
      ...project,
      updatedAt: Date.now(),
      scene: {
        bricks: project.scene.bricks.map((b) => ({
          ...b,
          position: { ...b.position },
        })),
        camera: project.scene.camera
          ? {
              position: [...project.scene.camera.position] as [
                number,
                number,
                number,
              ],
              target: [...project.scene.camera.target] as [
                number,
                number,
                number,
              ],
            }
          : undefined,
      },
    },
  };
}

export function downloadProjectFile(project: Project): void {
  const payload = buildProjectFile(project);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const name = project.name.replace(/[^\w\-]+/g, "_").toLowerCase() || "figure";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.frontfigure.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function parseProjectFile(
  file: File,
): Promise<ProjectFilePayload> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }
  if (!isProjectFilePayload(data)) {
    throw new Error("Not a valid Frontfigure project file.");
  }
  return data;
}
