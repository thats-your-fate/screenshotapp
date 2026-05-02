import { NextResponse } from "next/server";

import { getCurrentApiUser } from "@/features/auth/server-api";
import { createAsset } from "@/features/assets/service";
import { storePublicFile } from "@/lib/storage/local-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentApiUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") || "USER_UPLOAD");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const stored = await storePublicFile({
      folder: "uploads",
      fileNameHint: file.name,
      buffer,
    });

    const asset = await createAsset({
      name: file.name,
      type:
        type === "BACKGROUND" ||
        type === "OVERLAY" ||
        type === "DEVICE_FRAME" ||
        type === "STICKER" ||
        type === "ICON" ||
        type === "LOGO" ||
        type === "USER_UPLOAD" ||
        type === "OTHER"
          ? type
          : "USER_UPLOAD",
      fileUrl: stored.url,
      mimeType: file.type || "application/octet-stream",
      createdById: user.id,
    });

    return NextResponse.json({
      ok: true,
      fileUrl: stored.url,
      assetId: asset.id,
    });
  } catch (error) {
    console.error("Upload route failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected upload error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
