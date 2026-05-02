import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".bmp"]);

export type BackgroundLibraryItem = {
  url: string;
  label: string;
};

export async function listBackgroundLibraryItems(): Promise<BackgroundLibraryItem[]> {
  const backgroundsDir = path.join(process.cwd(), "public", "backgrounds");

  let entries: string[] = [];
  try {
    entries = await readdir(backgroundsDir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      url: `/backgrounds/${name}`,
      label: name,
    }));
}

