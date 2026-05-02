import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export type StoredFileResult = {
  url: string;
  absolutePath: string;
};

export async function storePublicFile(params: {
  folder: "uploads" | "exports";
  fileNameHint: string;
  buffer: Buffer;
}) : Promise<StoredFileResult> {
  const safeHint = params.fileNameHint.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeHint}`;
  const targetDir = path.join(PUBLIC_DIR, params.folder);
  const absolutePath = path.join(targetDir, fileName);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(absolutePath, params.buffer);

  return {
    url: `/${params.folder}/${fileName}`,
    absolutePath,
  };
}

export function dataUrlToBuffer(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL payload.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}
