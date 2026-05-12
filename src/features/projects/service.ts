import { db } from "@/lib/db/prisma";
import { trackServerEvent } from "@/lib/analytics/ga-server";
import { mergeElementsWithOverrides } from "@/features/editor/merge";
import type { EditorElement, EditorScreen } from "@/features/editor/types";

const SCREEN_ID_META_KEY = "__screenId";
const SCREEN_NAME_META_KEY = "__screenName";

async function ensureProjectEditorStateColumn() {
  const tableInfo = (await db.$queryRawUnsafe('PRAGMA table_info("Project")')) as Array<{
    name?: string;
  }>;
  const hasColumn = tableInfo.some((column) => column.name === "editorStateJson");
  if (!hasColumn) {
    await db.$executeRawUnsafe('ALTER TABLE "Project" ADD COLUMN "editorStateJson" TEXT');
  }
}

function parseElementData(input: string): EditorElement["data"] {
  try {
    const parsed = JSON.parse(input || "{}");
    if (!(typeof parsed === "object" && parsed)) {
      return {};
    }
    const data = { ...(parsed as EditorElement["data"]) };
    delete (data as Record<string, unknown>)[SCREEN_ID_META_KEY];
    delete (data as Record<string, unknown>)[SCREEN_NAME_META_KEY];
    return data;
  } catch {
    return {};
  }
}

function parseElementMeta(input: string) {
  try {
    const parsed = JSON.parse(input || "{}");
    if (!parsed || typeof parsed !== "object") {
      return { screenId: null as string | null, screenName: null as string | null };
    }
    const record = parsed as Record<string, unknown>;
    return {
      screenId: typeof record[SCREEN_ID_META_KEY] === "string" ? (record[SCREEN_ID_META_KEY] as string) : null,
      screenName: typeof record[SCREEN_NAME_META_KEY] === "string" ? (record[SCREEN_NAME_META_KEY] as string) : null,
    };
  } catch {
    return { screenId: null as string | null, screenName: null as string | null };
  }
}

function mapTemplateElement(element: {
  id: string;
  kind: "TEXT" | "IMAGE" | "SHAPE" | "DEVICE_SCREENSHOT_SLOT" | "GROUP";
  name: string;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  editableByUser: boolean;
  dataJson: string;
}): EditorElement {
  return {
    id: element.id,
    source: "template",
    kind: element.kind,
    name: element.name,
    zIndex: element.zIndex,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    locked: element.locked,
    visible: element.visible,
    editableByUser: element.editableByUser,
    data: parseElementData(element.dataJson),
  };
}

function mapCustomElement(element: {
  id: string;
  kind: "TEXT" | "IMAGE" | "SHAPE" | "DEVICE_SCREENSHOT_SLOT" | "GROUP";
  name: string;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  dataJson: string;
}): EditorElement {
  return {
    id: element.id,
    source: "custom",
    kind: element.kind,
    name: element.name,
    zIndex: element.zIndex,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    locked: false,
    visible: element.visible,
    editableByUser: true,
    data: parseElementData(element.dataJson),
  };
}

function isEditorScreenArray(value: unknown): value is EditorScreen[] {
  return (
    Array.isArray(value) &&
    value.every(
      (screen) =>
        !!screen &&
        typeof screen === "object" &&
        typeof (screen as { id?: unknown }).id === "string" &&
        typeof (screen as { name?: unknown }).name === "string" &&
        typeof (screen as { canvas?: unknown }).canvas === "object" &&
        Array.isArray((screen as { elements?: unknown[] }).elements),
    )
  );
}

function sanitizeTemplateElement(base: EditorElement, incoming: EditorElement): EditorElement {
  if (!base.editableByUser || base.locked) {
    return base;
  }

  return {
    ...base,
    x: incoming.x,
    y: incoming.y,
    width: incoming.width,
    height: incoming.height,
    rotation: incoming.rotation,
    zIndex: incoming.zIndex,
    visible: incoming.visible,
    opacity: incoming.opacity,
    data: incoming.data,
    name: incoming.name,
  };
}

export async function listUserProjects(userId: string) {
  return db.project.findMany({
    where: { userId },
    include: {
      template: {
        select: { id: true, name: true, slug: true, previewImageUrl: true },
      },
      exports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProjectFromTemplate(userId: string, templateId: string, name?: string) {
  const template = await db.template.findFirst({
    where: { id: templateId, status: "PUBLISHED" },
    include: {
      elements: {
        orderBy: { zIndex: "asc" },
      },
    },
  });

  if (!template) {
    throw new Error("Template not found or not published.");
  }

  const templateElements = template.elements.map(mapTemplateElement);
  const groupedScreens = new Map<string, { name: string; elements: EditorElement[] }>();
  const ungrouped: EditorElement[] = [];

  template.elements.forEach((row, index) => {
    const element = templateElements[index];
    if (!element) return;
    const meta = parseElementMeta(row.dataJson);
    if (!meta.screenId) {
      ungrouped.push(element);
      return;
    }

    const existing = groupedScreens.get(meta.screenId);
    if (existing) {
      existing.elements.push(element);
      if (meta.screenName && !existing.name) {
        existing.name = meta.screenName;
      }
    } else {
      groupedScreens.set(meta.screenId, {
        name: meta.screenName || "",
        elements: [element],
      });
    }
  });

  const initialScreens: EditorScreen[] =
    groupedScreens.size > 0
      ? Array.from(groupedScreens.entries()).map(([screenId, value], index) => ({
          id: screenId,
          name: value.name || `Screen ${index + 1}`,
          canvas: {
            width: template.canvasWidth,
            height: template.canvasHeight,
            backgroundColor: template.backgroundColor,
          },
          elements: value.elements.sort((a, b) => a.zIndex - b.zIndex),
        }))
      : [
          {
            id: "screen-1",
            name: "Screen 1",
            canvas: {
              width: template.canvasWidth,
              height: template.canvasHeight,
              backgroundColor: template.backgroundColor,
            },
            elements: templateElements,
          },
        ];

  if (ungrouped.length > 0) {
    initialScreens[0]?.elements.push(...ungrouped);
    initialScreens[0]?.elements.sort((a, b) => a.zIndex - b.zIndex);
  }

  const project = await db.project.create({
    data: {
      userId,
      templateId,
      name: name || `${template.name} Project`,
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
      editorStateJson: JSON.stringify(initialScreens),
      status: "DRAFT",
    },
  });

  await trackServerEvent({
    name: "template_work_started",
    userId,
    params: {
      template_id: templateId,
      project_id: project.id,
      template_name: template.name,
    },
  });

  return project;
}

export async function updateProjectNameForUser(params: { userId: string; projectId: string; name: string }) {
  const project = await db.project.findFirst({
    where: { id: params.projectId, userId: params.userId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  return db.project.update({
    where: { id: params.projectId },
    data: { name: params.name },
  });
}

export async function getProjectForUserEditor(userId: string, projectId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    include: {
      template: {
        include: {
          elements: { orderBy: { zIndex: "asc" } },
        },
      },
      overrides: true,
      customElements: {
        orderBy: { zIndex: "asc" },
      },
    },
  });

  if (!project) {
    return null;
  }

  const baseTemplateElements = project.template.elements.map(mapTemplateElement);

  const overrideMap = Object.fromEntries(
    project.overrides.map((override) => {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(override.overriddenPropsJson || "{}");
      } catch {
        parsed = {};
      }
      return [override.templateElementId, parsed];
    }),
  );

  const mergedElements = mergeElementsWithOverrides(baseTemplateElements, overrideMap);
  const customElements = project.customElements.map(mapCustomElement);
  const legacyElements = [...mergedElements, ...customElements].sort((a, b) => a.zIndex - b.zIndex);

  if (project.editorStateJson) {
    try {
      const parsed = JSON.parse(project.editorStateJson);
      if (isEditorScreenArray(parsed) && parsed.length > 0) {
        return {
          project,
          screens: parsed,
        };
      }
    } catch {
      // fall back to legacy assembled state below
    }
  }

  const defaultScreen: EditorScreen = {
    id: "screen-1",
    name: "Screen 1",
    canvas: {
      width: project.canvasWidth,
      height: project.canvasHeight,
      backgroundColor: project.template.backgroundColor,
    },
    elements: legacyElements,
  };

  return {
    project,
    screens: [defaultScreen],
  };
}

export async function saveProjectEditorState(params: {
  userId: string;
  projectId: string;
  screens: EditorScreen[];
}) {
  const project = await db.project.findFirst({
    where: { id: params.projectId, userId: params.userId },
    include: {
      template: {
        include: {
          elements: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const templateMap = new Map(project.template.elements.map((element) => [element.id, mapTemplateElement(element)]));

  const sanitizedScreens: EditorScreen[] = params.screens.map((screen, index) => {
    const sanitizedElements = screen.elements
      .map((element) => {
        const baseTemplate = templateMap.get(element.id);
        if (baseTemplate) {
          return sanitizeTemplateElement(baseTemplate, { ...element, source: "template" });
        }

        return {
          ...element,
          source: "custom" as const,
          editableByUser: true,
          locked: false,
        };
      })
      .sort((a, b) => a.zIndex - b.zIndex);

    return {
      id: screen.id || `screen-${index + 1}`,
      name: screen.name || `Screen ${index + 1}`,
      canvas: {
        width: screen.canvas.width,
        height: screen.canvas.height,
        backgroundColor: screen.canvas.backgroundColor || project.template.backgroundColor,
      },
      elements: sanitizedElements,
    };
  });

  const first = sanitizedScreens[0];
  if (!first) {
    throw new Error("At least one screen is required.");
  }

  const baseData = {
    canvasWidth: first.canvas.width,
    canvasHeight: first.canvas.height,
  };

  try {
    await db.project.update({
      where: { id: params.projectId },
      data: {
        ...baseData,
        editorStateJson: JSON.stringify(sanitizedScreens),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("editorStateJson")) {
      await ensureProjectEditorStateColumn();
      await db.$executeRawUnsafe(
        'UPDATE "Project" SET "canvasWidth" = ?, "canvasHeight" = ?, "editorStateJson" = ? WHERE "id" = ?',
        baseData.canvasWidth,
        baseData.canvasHeight,
        JSON.stringify(sanitizedScreens),
        params.projectId,
      );
      return;
    }
    throw error;
  }
}

export async function saveElementOverrideForProject(params: {
  userId: string;
  projectId: string;
  templateElementId: string;
  overriddenProps: Record<string, unknown>;
}) {
  const project = await db.project.findFirst({
    where: { id: params.projectId, userId: params.userId },
    include: {
      template: {
        include: {
          elements: {
            where: { id: params.templateElementId },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const templateElement = project.template.elements[0];
  if (!templateElement || !templateElement.editableByUser || templateElement.locked) {
    throw new Error("Element cannot be overridden by this user.");
  }

  return db.projectElementOverride.upsert({
    where: {
      projectId_templateElementId: {
        projectId: params.projectId,
        templateElementId: params.templateElementId,
      },
    },
    create: {
      projectId: params.projectId,
      templateElementId: params.templateElementId,
      overriddenPropsJson: JSON.stringify(params.overriddenProps),
    },
    update: {
      overriddenPropsJson: JSON.stringify(params.overriddenProps),
    },
  });
}

export async function listUserExports(userId: string) {
  return db.export.findMany({
    where: {
      project: { userId },
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
