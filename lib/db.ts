import Dexie, { type EntityTable } from "dexie";
import type { Project } from "@/types/project";

export class FrontfigureDB extends Dexie {
  projects!: EntityTable<Project, "id">;

  constructor() {
    super("frontfigure");
    this.version(1).stores({
      projects: "id, name, updatedAt, createdAt",
    });
  }
}

export const db = new FrontfigureDB();

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function saveProject(project: Project): Promise<void> {
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function renameProject(id: string, name: string): Promise<void> {
  await db.projects.update(id, { name, updatedAt: Date.now() });
}
