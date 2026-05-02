import { notFound } from "next/navigation";

import { AdminTemplateEditor } from "@/components/editor/admin-template-editor";
import { listBackgroundLibraryItems } from "@/features/assets/background-library";
import { getTemplateForAdmin } from "@/features/templates/service";

export default async function AdminTemplateEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = await getTemplateForAdmin(templateId);
  const backgroundLibrary = await listBackgroundLibraryItems();

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-slate-900">Template Editor: {template.name}</h1>
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
