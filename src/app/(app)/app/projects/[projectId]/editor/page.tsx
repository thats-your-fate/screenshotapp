import { notFound } from "next/navigation";

import { UserProjectEditor } from "@/components/editor/user-project-editor";
import { listBackgroundLibraryItems } from "@/features/assets/background-library";
import { requireUser } from "@/features/auth/server";
import { getProjectForUserEditor } from "@/features/projects/service";

export default async function ProjectEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ exportMode?: string; screenId?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const query = await searchParams;
  const result = await getProjectForUserEditor(user.id, projectId);
  const backgroundLibrary = await listBackgroundLibraryItems();

  if (!result) {
    notFound();
  }

  return (
    <UserProjectEditor
      projectId={result.project.id}
      initialProjectName={result.project.name}
      initialScreens={result.screens}
      backgroundLibrary={backgroundLibrary}
      exportMode={query.exportMode === "1"}
      initialActiveScreenId={query.screenId}
    />
  );
}
