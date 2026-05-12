import { notFound, redirect } from "next/navigation";

import { AdminTemplateEditor } from "@/components/editor/admin-template-editor";
import { listBackgroundLibraryItems } from "@/features/assets/background-library";
import { requireUser } from "@/features/auth/server";
import { getTemplateForAdmin } from "@/features/templates/service";
import { getAppCopy } from "@/lib/i18n/app";

export default async function AppTemplateEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/app/templates");
  }

  const { templateId } = await params;
  const template = await getTemplateForAdmin(templateId);
  const backgroundLibrary = await listBackgroundLibraryItems();
  const { copy } = await getAppCopy();

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">{copy.editor.templateEditor}: {template.name}</h1>
      <AdminTemplateEditor
        templateId={template.id}
        canvasWidth={template.canvasWidth}
        canvasHeight={template.canvasHeight}
        initialBackgroundColor={template.backgroundColor}
        initialScreens={template.editorScreens}
        backgroundLibrary={backgroundLibrary}
      />
    </div>
  );
}
