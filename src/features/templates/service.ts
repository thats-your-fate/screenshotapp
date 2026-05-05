import { type Prisma, type ElementKind } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import type { EditorElement, EditorScreen } from "@/features/editor/types";

const SCREEN_ID_META_KEY = "__screenId";
const SCREEN_NAME_META_KEY = "__screenName";

const templateListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  category: true,
  previewImageUrl: true,
  canvasWidth: true,
  canvasHeight: true,
  publishedAt: true,
  updatedAt: true,
} satisfies Prisma.TemplateSelect;

function mapTemplateElement(element: {
  id: string;
  kind: ElementKind;
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
  let parsedData: EditorElement["data"] = {};
  try {
    parsedData = JSON.parse(element.dataJson || "{}");
  } catch {
    parsedData = {};
  }

  const cleanData: Record<string, unknown> = { ...parsedData };
  delete cleanData[SCREEN_ID_META_KEY];
  delete cleanData[SCREEN_NAME_META_KEY];

  return {
    id: element.id,
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
    data: cleanData as EditorElement["data"],
  };
}

function parseTemplateElementMeta(element: { dataJson: string }) {
  let parsedData: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(element.dataJson || "{}");
    parsedData = typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : {};
  } catch {
    parsedData = {};
  }

  return {
    screenId: typeof parsedData[SCREEN_ID_META_KEY] === "string" ? (parsedData[SCREEN_ID_META_KEY] as string) : null,
    screenName:
      typeof parsedData[SCREEN_NAME_META_KEY] === "string" ? (parsedData[SCREEN_NAME_META_KEY] as string) : null,
  };
}

function buildTemplateScreensFromElements(params: {
  elements: Array<{
    id: string;
    kind: ElementKind;
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
  }>;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}): EditorScreen[] {
  const groups = new Map<string, { name: string; elements: EditorElement[] }>();
  const ungrouped: EditorElement[] = [];

  for (const element of params.elements) {
    const mapped = mapTemplateElement(element);
    const meta = parseTemplateElementMeta(element);

    if (!meta.screenId) {
      ungrouped.push(mapped);
      continue;
    }

    const existing = groups.get(meta.screenId);
    if (existing) {
      existing.elements.push(mapped);
      if (meta.screenName && !existing.name) {
        existing.name = meta.screenName;
      }
    } else {
      groups.set(meta.screenId, {
        name: meta.screenName || "",
        elements: [mapped],
      });
    }
  }

  if (groups.size === 0) {
    return [
      {
        id: "screen-1",
        name: "Screen 1",
        canvas: {
          width: params.canvasWidth,
          height: params.canvasHeight,
          backgroundColor: params.backgroundColor,
        },
        elements: params.elements.map(mapTemplateElement).sort((a, b) => a.zIndex - b.zIndex),
      },
    ];
  }

  const screens = Array.from(groups.entries()).map(([screenId, value], index) => ({
    id: screenId,
    name: value.name || `Screen ${index + 1}`,
    canvas: {
      width: params.canvasWidth,
      height: params.canvasHeight,
      backgroundColor: params.backgroundColor,
    },
    elements: value.elements.sort((a, b) => a.zIndex - b.zIndex),
  }));

  if (ungrouped.length > 0) {
    screens[0]?.elements.push(...ungrouped);
    screens[0]!.elements.sort((a, b) => a.zIndex - b.zIndex);
  }

  return screens;
}

export async function listPublishedTemplates() {
  const templates = await db.template.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      ...templateListSelect,
      backgroundColor: true,
      elements: {
        orderBy: { zIndex: "asc" },
        select: {
          id: true,
          kind: true,
          name: true,
          zIndex: true,
          x: true,
          y: true,
          width: true,
          height: true,
          rotation: true,
          opacity: true,
          locked: true,
          visible: true,
          editableByUser: true,
          dataJson: true,
        },
      },
    },
  });

  return templates.map((template) => ({
    ...template,
    editorScreens: buildTemplateScreensFromElements({
      elements: template.elements,
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
      backgroundColor: template.backgroundColor,
    }),
  }));
}

export async function listAdminTemplates() {
  const templates = await db.template.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      ...templateListSelect,
      backgroundColor: true,
      elements: {
        orderBy: { zIndex: "asc" },
        select: {
          id: true,
          kind: true,
          name: true,
          zIndex: true,
          x: true,
          y: true,
          width: true,
          height: true,
          rotation: true,
          opacity: true,
          locked: true,
          visible: true,
          editableByUser: true,
          dataJson: true,
        },
      },
    },
  });

  return templates.map((template) => ({
    ...template,
    editorScreens: buildTemplateScreensFromElements({
      elements: template.elements,
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
      backgroundColor: template.backgroundColor,
    }),
  }));
}

export async function getTemplateForAdmin(templateId: string) {
  const template = await db.template.findUnique({
    where: { id: templateId },
    include: {
      elements: {
        orderBy: { zIndex: "asc" },
      },
    },
  });

  if (!template) {
    return null;
  }

  const editorScreens = buildTemplateScreensFromElements({
    elements: template.elements,
    canvasWidth: template.canvasWidth,
    canvasHeight: template.canvasHeight,
    backgroundColor: template.backgroundColor,
  });

  return {
    ...template,
    editorElements: editorScreens[0]?.elements ?? [],
    editorScreens,
  };
}

export async function getPublishedTemplateWithElements(templateId: string) {
  const template = await db.template.findFirst({
    where: { id: templateId, status: "PUBLISHED" },
    include: {
      elements: { orderBy: { zIndex: "asc" } },
    },
  });

  if (!template) {
    return null;
  }

  return {
    ...template,
    editorElements: template.elements.map(mapTemplateElement),
  };
}

export async function createTemplate(input: {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  createdById: string;
}) {
  return db.template.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category: input.category || null,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      backgroundColor: input.backgroundColor,
      createdById: input.createdById,
      status: "DRAFT",
    },
  });
}

export async function updateTemplateMeta(
  templateId: string,
  input: {
    name: string;
    slug: string;
    description?: string;
    category?: string;
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
  },
) {
  return db.template.update({
    where: { id: templateId },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category: input.category || null,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      backgroundColor: input.backgroundColor,
    },
  });
}

export async function setTemplateStatus(templateId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  return db.template.update({
    where: { id: templateId },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function deleteTemplate(templateId: string) {
  return db.template.delete({ where: { id: templateId } });
}

export async function saveTemplateElements(
  templateId: string,
  input: {
    elements?: EditorElement[];
    screens?: EditorScreen[];
    backgroundColor?: string;
  },
) {
  const screens =
    input.screens && input.screens.length > 0
      ? input.screens
      : [
          {
            id: "screen-1",
            name: "Screen 1",
            canvas: { width: 0, height: 0, backgroundColor: input.backgroundColor || "#ffffff" },
            elements: input.elements ?? [],
          },
        ];

  await db.$transaction(async (tx) => {
    await tx.templateElement.deleteMany({ where: { templateId } });

    const usedIds = new Set<string>();
    const flattened = screens.flatMap((screen, screenIndex) =>
      screen.elements.map((element, elementIndex) => {
        let nextId = element.id;
        while (usedIds.has(nextId)) {
          nextId = `${element.id}-${screenIndex + 1}-${elementIndex + 1}`;
        }
        usedIds.add(nextId);

        return {
          id: nextId,
          templateId,
          kind: element.kind,
          name: element.name,
          zIndex: element.zIndex ?? elementIndex,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          rotation: element.rotation,
          opacity: element.opacity,
          locked: element.locked,
          visible: element.visible,
          editableByUser: element.editableByUser,
          dataJson: JSON.stringify({
            ...element.data,
            [SCREEN_ID_META_KEY]: screen.id,
            [SCREEN_NAME_META_KEY]: screen.name,
          }),
        };
      }),
    );

    if (flattened.length > 0) {
      await tx.templateElement.createMany({
        data: flattened,
      });
    }

    if (input.backgroundColor) {
      await tx.template.update({ where: { id: templateId }, data: { backgroundColor: input.backgroundColor } });
    }
  });
}
