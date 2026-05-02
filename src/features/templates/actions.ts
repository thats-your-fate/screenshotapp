"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { EditorElement } from "@/features/editor/types";
import { requireAdmin } from "@/features/auth/server";
import {
  createTemplate,
  deleteTemplate,
  saveTemplateElements,
  setTemplateStatus,
  updateTemplateMeta,
} from "@/features/templates/service";
import { createTemplateSchema } from "@/features/templates/validations";

export async function createTemplateAction(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    category: formData.get("category"),
    canvasWidth: formData.get("canvasWidth"),
    canvasHeight: formData.get("canvasHeight"),
    backgroundColor: formData.get("backgroundColor") || "#ffffff",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template payload.");
  }

  const template = await createTemplate({
    ...parsed.data,
    createdById: admin.id,
    description: parsed.data.description || undefined,
    category: parsed.data.category || undefined,
  });

  revalidatePath("/admin/templates");
  revalidatePath("/app/templates");
  redirect(`/app/templates/${template.id}/editor`);
}

export async function updateTemplateMetaAction(templateId: string, formData: FormData) {
  await requireAdmin();

  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    category: formData.get("category"),
    canvasWidth: formData.get("canvasWidth"),
    canvasHeight: formData.get("canvasHeight"),
    backgroundColor: formData.get("backgroundColor") || "#ffffff",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid template payload.");
  }

  await updateTemplateMeta(templateId, {
    ...parsed.data,
    description: parsed.data.description || undefined,
    category: parsed.data.category || undefined,
  });

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${templateId}/edit`);
  revalidatePath("/app/templates");
  revalidatePath(`/app/templates/${templateId}/edit`);
}

export async function saveTemplateElementsAction(params: {
  templateId: string;
  backgroundColor: string;
  elements?: EditorElement[];
  screens?: Array<{
    id: string;
    name: string;
    canvas: { width: number; height: number; backgroundColor: string };
    elements: EditorElement[];
  }>;
}) {
  await requireAdmin();
  await saveTemplateElements(params.templateId, {
    elements: params.elements,
    screens: params.screens,
    backgroundColor: params.backgroundColor,
  });
  revalidatePath(`/admin/templates/${params.templateId}/editor`);
  revalidatePath(`/app/templates/${params.templateId}/editor`);
  revalidatePath(`/app/templates`);
  return { ok: true };
}

export async function publishTemplateAction(templateId: string) {
  await requireAdmin();
  await setTemplateStatus(templateId, "PUBLISHED");
  revalidatePath("/admin/templates");
  revalidatePath("/app/templates");
}

export async function unpublishTemplateAction(templateId: string) {
  await requireAdmin();
  await setTemplateStatus(templateId, "DRAFT");
  revalidatePath("/admin/templates");
  revalidatePath("/app/templates");
}

export async function archiveTemplateAction(templateId: string) {
  await requireAdmin();
  await setTemplateStatus(templateId, "ARCHIVED");
  revalidatePath("/admin/templates");
  revalidatePath("/app/templates");
}

export async function deleteTemplateAction(templateId: string) {
  await requireAdmin();
  await deleteTemplate(templateId);
  revalidatePath("/admin/templates");
}
