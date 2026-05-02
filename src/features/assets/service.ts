import { db } from "@/lib/db/prisma";

export async function listAssetsForAdmin() {
  return db.asset.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function createAsset(input: {
  name: string;
  type: "BACKGROUND" | "OVERLAY" | "DEVICE_FRAME" | "STICKER" | "ICON" | "LOGO" | "USER_UPLOAD" | "OTHER";
  fileUrl: string;
  mimeType: string;
  width?: number;
  height?: number;
  createdById: string;
}) {
  return db.asset.create({
    data: {
      name: input.name,
      type: input.type,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      createdById: input.createdById,
    },
  });
}

export async function deleteAsset(assetId: string) {
  return db.asset.delete({ where: { id: assetId } });
}
