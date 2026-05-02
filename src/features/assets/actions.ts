"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/server";
import { createAssetSchema } from "@/features/assets/validations";
import { createAsset, deleteAsset } from "@/features/assets/service";

export async function createAssetAction(input: unknown) {
  await requireAdmin();

  const parsed = createAssetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid asset payload." };
  }

  await createAsset({ ...parsed.data, createdById: (await requireAdmin()).id });
  revalidatePath("/admin/assets");
  return { ok: true };
}

export async function deleteAssetAction(assetId: string) {
  await requireAdmin();
  await deleteAsset(assetId);
  revalidatePath("/admin/assets");
}
