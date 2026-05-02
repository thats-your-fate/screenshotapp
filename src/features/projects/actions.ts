"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server";
import {
  createProjectFromTemplateSchema,
  saveOverrideSchema,
  saveProjectEditorStateSchema,
  updateProjectNameSchema,
} from "@/features/projects/validations";
import {
  createProjectFromTemplate,
  saveElementOverrideForProject,
  saveProjectEditorState,
  updateProjectNameForUser,
} from "@/features/projects/service";

export async function createProjectFromTemplateAction(formData: FormData) {
  const user = await requireUser();
  const rawName = formData.get("name");

  const parsed = createProjectFromTemplateSchema.safeParse({
    templateId: formData.get("templateId"),
    name: typeof rawName === "string" && rawName.trim().length > 0 ? rawName : undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const project = await createProjectFromTemplate(user.id, parsed.data.templateId, parsed.data.name);

  revalidatePath("/app/projects");
  redirect(`/app/projects/${project.id}/editor`);
}

export async function saveProjectElementOverrideAction(input: unknown) {
  const user = await requireUser();
  const parsed = saveOverrideSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid override payload." };
  }

  await saveElementOverrideForProject({
    userId: user.id,
    projectId: parsed.data.projectId,
    templateElementId: parsed.data.templateElementId,
    overriddenProps: parsed.data.overriddenProps,
  });

  revalidatePath(`/app/projects/${parsed.data.projectId}/editor`);
  return { ok: true };
}

export async function saveProjectEditorStateAction(input: unknown) {
  const user = await requireUser();
  const parsed = saveProjectEditorStateSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid editor payload." };
  }

  try {
    await saveProjectEditorState({
      userId: user.id,
      projectId: parsed.data.projectId,
      screens: parsed.data.screens,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save project state.",
    };
  }

  revalidatePath(`/app/projects/${parsed.data.projectId}/editor`);
  revalidatePath("/app/projects");
  return { ok: true };
}

export async function updateProjectNameAction(input: unknown) {
  const user = await requireUser();
  const parsed = updateProjectNameSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid project name." };
  }

  try {
    await updateProjectNameForUser({
      userId: user.id,
      projectId: parsed.data.projectId,
      name: parsed.data.name,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update project name.",
    };
  }

  revalidatePath(`/app/projects/${parsed.data.projectId}/editor`);
  revalidatePath("/app/projects");
  revalidatePath("/app/exports");
  return { ok: true };
}
