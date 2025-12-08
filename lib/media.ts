import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";

export type MediaFile = {
  id: string;
  name: string;
  relativePath: string;
  size: number;
  modifiedAt: string;
};

const uploadsRoot = path.join(process.cwd(), "public", "uploads");

export async function listMediaFiles(): Promise<MediaFile[]> {
  const entries: MediaFile[] = [];

  async function walk(dir: string, relativeBase = "") {
    let dirEntries: Dirent[];
    try {
      dirEntries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.warn("[media] Failed to read directory", dir, error);
      return;
    }

    for (const entry of dirEntries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(relativeBase, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath, relativePath);
        continue;
      }

      const stats = await fs.stat(fullPath);
      entries.push({
        id: `${relativePath}-${stats.mtimeMs}`,
        name: entry.name,
        relativePath,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      });
    }
  }

  await walk(uploadsRoot, "");
  return entries.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
}

export async function deleteMedia(relativePath: string) {
  const normalized = relativePath.replace(/\.\./g, "").replace(/^\/+/, "");
  const fullPath = path.join(uploadsRoot, normalized);
  await fs.unlink(fullPath);
}
