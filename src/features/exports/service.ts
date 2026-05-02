import { db } from "@/lib/db/prisma";

export async function createProjectExport(params: {
  projectId: string;
  format: "PNG" | "JPG" | "WEBP";
  scale: number;
  outputUrl: string;
}) {
  return db.$transaction(async (tx) => {
    const created = await tx.export.create({
      data: {
        projectId: params.projectId,
        format: params.format,
        scale: params.scale,
        outputUrl: params.outputUrl,
      },
    });

    await tx.project.update({
      where: { id: params.projectId },
      data: { status: "EXPORTED", thumbnailUrl: params.outputUrl },
    });

    return created;
  });
}
