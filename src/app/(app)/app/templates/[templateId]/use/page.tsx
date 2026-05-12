import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server";
import { createProjectFromTemplate } from "@/features/projects/service";

export default async function UseTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const user = await requireUser();
  const { templateId } = await params;

  const project = await createProjectFromTemplate(user.id, templateId).catch(() => null);

  if (!project) {
    notFound();
  }

  redirect(`/app/projects/${project.id}/editor`);
}
