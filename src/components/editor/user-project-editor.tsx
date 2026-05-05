"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import { EditorCanvasStage, EditorCanvasStatic } from "@/components/editor/editor-canvas";
import { BackgroundImagePicker } from "@/components/editor/background-image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEVICE_PRESETS, findDevicePreset } from "@/features/editor/device-presets";
import { FONT_OPTIONS } from "@/features/editor/fonts";
import type { EditorElement, EditorScreen } from "@/features/editor/types";
import { saveProjectEditorStateAction, updateProjectNameAction } from "@/features/projects/actions";

type ExportOutputFormat = "PNG" | "JPG" | "WEBP";
const TEXT_ALIGN_OPTIONS = ["left", "center", "right"] as const;

function createCustomElement(
  kind: "TEXT" | "IMAGE" | "DEVICE_SCREENSHOT_SLOT",
  zIndex: number,
  canvas?: { width: number; height: number },
): EditorElement {
  const id = crypto.randomUUID();

  if (kind === "TEXT") {
    return {
      id,
      source: "custom",
      kind,
      name: "Text Overlay",
      zIndex,
      x: 80,
      y: 120,
      width: 620,
      height: 160,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      editableByUser: true,
      data: {
        text: "New text",
        fontSize: 64,
        fontWeight: "bold",
        fontStyle: "normal",
        fontFamily: "space",
        color: "#0f172a",
        align: "left",
      },
    };
  }

  if (kind === "DEVICE_SCREENSHOT_SLOT") {
    const canvasWidth = canvas?.width || 1170;
    const canvasHeight = canvas?.height || 2532;
    const deviceHeight = Math.max(280, Math.round(canvasHeight * 0.94));
    const deviceWidth = Math.max(120, Math.round((deviceHeight * 1170) / 2532));

    return {
      id,
      source: "custom",
      kind,
      name: "iPhone Device",
      zIndex,
      x: Math.round((canvasWidth - deviceWidth) / 2),
      y: Math.round((canvasHeight - deviceHeight) / 2),
      width: deviceWidth,
      height: deviceHeight,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      editableByUser: true,
      data: {
        deviceType: "iphone",
        deviceBackgroundColor: "#0b1020",
        deviceMaskFillAssetUrl: null,
        assetUrl: "",
        fit: "cover",
        placeholderLabel: "Upload screenshot",
        deviceScreenOffsetX: 0,
        deviceScreenOffsetY: 0,
        deviceScreenScale: 1,
        deviceMaskOffsetX: 0,
        deviceMaskOffsetY: 0,
        deviceMaskScale: 1,
      },
    };
  }

  return {
    id,
    source: "custom",
    kind,
    name: "Graphic Overlay",
    zIndex,
    x: 100,
    y: 260,
    width: 520,
    height: 520,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    editableByUser: true,
    data: {
      assetUrl: "",
      fit: "contain",
      placeholderLabel: "Upload overlay",
      borderRadius: 0,
    },
  };
}

function isCommonBackgroundElement(element: EditorElement) {
  return element.kind === "IMAGE" && element.data.commonBackground === true;
}

function isSharedDeviceElement(element: EditorElement) {
  return (
    (element.kind === "DEVICE_SCREENSHOT_SLOT" || element.data.deviceType === "iphone") &&
    !!element.data.sharedDevicePairId &&
    typeof element.data.sharedDeviceStartIndex === "number"
  );
}

function createCommonBackgroundElement(zIndex: number, canvas: { width: number; height: number }) {
  return {
    id: crypto.randomUUID(),
    source: "custom" as const,
    kind: "IMAGE" as const,
    name: "Common Background",
    zIndex,
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    editableByUser: true,
    data: {
      assetUrl: "",
      fit: "cover" as const,
      placeholderLabel: "Upload shared background",
      commonBackground: true,
    },
  };
}

function isIphonePresetId(presetId: string) {
  return presetId.startsWith("iphone-");
}

function createNewScreenFromCurrent(current: EditorScreen, index: number): EditorScreen {
  const clonedElements = current.elements.map((element) => ({
    ...element,
    id: element.source === "custom" && !isCommonBackgroundElement(element) ? crypto.randomUUID() : element.id,
    data: {
      ...element.data,
      sharedDevicePairId: undefined,
      sharedDeviceStartIndex: undefined,
      sharedDeviceSpanWidth: undefined,
    },
  }));

  return {
    id: crypto.randomUUID(),
    name: `Screen ${index + 1}`,
    canvas: { ...current.canvas },
    elements: clonedElements,
  };
}

function sanitizeFilePart(value: string) {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned.length > 0 ? cleaned : "screen";
}

function downloadFile(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function formatExportError(error: unknown, fallback: string) {
  if (error instanceof Event) {
    const target = error.target as (EventTarget & { tagName?: string; src?: string }) | null;
    const tag = target?.tagName ? ` (${target.tagName.toLowerCase()})` : "";
    const src = target?.src ? `: ${target.src}` : "";
    return `${fallback}${tag}${src}`;
  }

  if (error instanceof Error) {
    if (error.message && error.message.trim().length > 0) {
      return error.message;
    }
    return `${fallback} (empty error message)`;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    try {
      return `${fallback}: ${JSON.stringify(error)}`;
    } catch {
      return `${fallback}: ${String(error)}`;
    }
  }

  return fallback;
}

function isFullCanvasImageLayer(element: EditorElement, canvas: { width: number; height: number }) {
  if (element.kind !== "IMAGE" || !element.visible) return false;
  const coversWidth = element.x <= 2 && element.width >= canvas.width * 0.95;
  const coversHeight = element.y <= 2 && element.height >= canvas.height * 0.95;
  return coversWidth && coversHeight;
}

function getSharedOverlayElement(screen: EditorScreen) {
  const commonBackground = screen.elements.find((element) => element.visible && isCommonBackgroundElement(element));
  if (commonBackground) {
    return commonBackground;
  }

  return (
    screen.elements
      .filter((element) => {
        if (!element.visible || element.kind !== "IMAGE") return false;
        if (!element.data.assetUrl) return false;
        const coversWidth = element.x <= 2 && element.width >= screen.canvas.width * 0.95;
        const coversHeight = element.y <= 2 && element.height >= screen.canvas.height * 0.95;
        return coversWidth && coversHeight;
      })
      .sort((a, b) => a.zIndex - b.zIndex)[0] ?? null
  );
}

export function UserProjectEditor({
  projectId,
  initialProjectName,
  initialScreens,
  backgroundLibrary,
  exportMode = false,
  initialActiveScreenId,
}: {
  projectId: string;
  initialProjectName: string;
  initialScreens: EditorScreen[];
  backgroundLibrary: Array<{ url: string; label: string }>;
  exportMode?: boolean;
  initialActiveScreenId?: string;
}) {
  const safeInitialActive =
    initialActiveScreenId && initialScreens.some((screen) => screen.id === initialActiveScreenId)
      ? initialActiveScreenId
      : initialScreens[0]?.id ?? "";
  const [screens, setScreens] = useState<EditorScreen[]>(initialScreens);
  const [activeScreenId, setActiveScreenId] = useState(safeInitialActive);
  const [selectedId, setSelectedId] = useState<string | null>(
    exportMode ? null : initialScreens[0]?.elements[0]?.id ?? null,
  );
  const [pending, startTransition] = useTransition();
  const [projectName, setProjectName] = useState(initialProjectName);
  const [projectNameDraft, setProjectNameDraft] = useState(initialProjectName);
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [namePending, startNameTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" | "warning" } | null>(null);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportOutputFormat>("PNG");
  const [exportQuality, setExportQuality] = useState(82);
  const [screenViewMode, setScreenViewMode] = useState<"single" | "list">("single");
  const [deviceLayerTarget, setDeviceLayerTarget] = useState<"frame" | "screen" | "background">("frame");
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const activeScreen = useMemo(
    () => screens.find((screen) => screen.id === activeScreenId) || screens[0],
    [screens, activeScreenId],
  );

  const selected = useMemo(
    () => activeScreen?.elements.find((element) => element.id === selectedId) || null,
    [activeScreen, selectedId],
  );
  const availableImageOptions = useMemo(() => {
    if (!selected || selected.kind !== "IMAGE") {
      return backgroundLibrary;
    }

    if (selected.data.assetUrl && !backgroundLibrary.some((item) => item.url === selected.data.assetUrl)) {
      return [{ url: selected.data.assetUrl, label: `Current: ${selected.data.assetUrl}` }, ...backgroundLibrary];
    }

    return backgroundLibrary;
  }, [selected, backgroundLibrary]);
  const activeScreenIndex = useMemo(
    () => screens.findIndex((screen) => screen.id === activeScreen.id),
    [screens, activeScreen.id],
  );
  const commonBackgroundLayer = useMemo(
    () => screens.flatMap((screen) => screen.elements).find((element) => isCommonBackgroundElement(element)) || null,
    [screens],
  );
  const hasCommonBackground = !!commonBackgroundLayer?.data.assetUrl;
  const singleModeElements = useMemo(() => {
    if (!hasCommonBackground) {
      return activeScreen.elements;
    }

    return activeScreen.elements.filter(
      (element) => !isFullCanvasImageLayer(element, activeScreen.canvas) || isCommonBackgroundElement(element),
    );
  }, [activeScreen.elements, activeScreen.canvas, hasCommonBackground]);
  const sharedOverlayAssetUrl = useMemo(() => getSharedOverlayElement(screens[0])?.data.assetUrl ?? null, [screens]);

  if (!activeScreen) {
    return null;
  }

  if (exportMode) {
    return (
      <div ref={canvasWrapperRef} className="p-4">
        <EditorCanvasStatic
          rootId={`editor-canvas-root-${activeScreen.id}`}
          canvas={activeScreen.canvas}
          elements={singleModeElements}
          scale={1}
          commonBackgroundSpan={{
            index: activeScreenIndex >= 0 ? activeScreenIndex : 0,
            total: Math.max(1, screens.length),
          }}
        />
      </div>
    );
  }

  function canEdit(element: EditorElement) {
    return (element.source === "custom" || element.editableByUser) && !element.locked;
  }

  function updateActiveScreen(mutator: (screen: EditorScreen) => EditorScreen) {
    setScreens((prev) => prev.map((screen) => (screen.id === activeScreen.id ? mutator(screen) : screen)));
  }

  function updateElement(id: string, patch: Partial<EditorElement>) {
    const target = activeScreen.elements.find((element) => element.id === id);
    const sharedPairId = target?.data.sharedDevicePairId;
    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) => (element.id === id ? { ...element, ...patch } : element)),
        })),
      );
      return;
    }

    if (sharedPairId) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) =>
            element.data.sharedDevicePairId === sharedPairId ? { ...element, ...patch } : element,
          ),
        })),
      );
      return;
    }

    updateActiveScreen((screen) => ({
      ...screen,
      elements: screen.elements.map((element) => (element.id === id ? { ...element, ...patch } : element)),
    }));
  }

  function updateSelectedData(key: string, value: unknown) {
    if (!selectedId) return;
    const target = activeScreen.elements.find((element) => element.id === selectedId);
    const sharedPairId = target?.data.sharedDevicePairId;
    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) =>
            element.id === selectedId
              ? {
                  ...element,
                  data: {
                    ...element.data,
                    [key]: value,
                  },
                }
              : element,
          ),
        })),
      );
      return;
    }

    if (sharedPairId) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) =>
            element.data.sharedDevicePairId === sharedPairId
              ? {
                  ...element,
                  data: {
                    ...element.data,
                    [key]: value,
                  },
                }
              : element,
          ),
        })),
      );
      return;
    }

    updateActiveScreen((screen) => ({
      ...screen,
      elements: screen.elements.map((element) =>
        element.id === selectedId
          ? {
              ...element,
              data: {
                ...element.data,
                [key]: value,
              },
            }
          : element,
      ),
    }));
  }

  function updateElementData(id: string, patch: Partial<EditorElement["data"]>) {
    const target = activeScreen.elements.find((element) => element.id === id);
    const sharedPairId = target?.data.sharedDevicePairId;
    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) =>
            element.id === id
              ? {
                  ...element,
                  data: {
                    ...element.data,
                    ...patch,
                  },
                }
              : element,
          ),
        })),
      );
      return;
    }

    if (sharedPairId) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.map((element) =>
            element.data.sharedDevicePairId === sharedPairId
              ? {
                  ...element,
                  data: {
                    ...element.data,
                    ...patch,
                  },
                }
              : element,
          ),
        })),
      );
      return;
    }

    updateActiveScreen((screen) => ({
      ...screen,
      elements: screen.elements.map((element) =>
        element.id === id
          ? {
              ...element,
              data: {
                ...element.data,
                ...patch,
              },
            }
          : element,
      ),
    }));
  }

  function addOverlay(kind: "TEXT" | "IMAGE" | "DEVICE_SCREENSHOT_SLOT") {
    const maxZ = activeScreen.elements.length > 0 ? Math.max(...activeScreen.elements.map((el) => el.zIndex)) : 0;
    const newElement = createCustomElement(kind, maxZ + 1, activeScreen.canvas);

    updateActiveScreen((screen) => ({
      ...screen,
      elements: [...screen.elements, newElement],
    }));

    setSelectedId(newElement.id);
  }

  function deleteSelectedCustomElement() {
    if (!selected || selected.source !== "custom") return;

    if (isCommonBackgroundElement(selected)) {
      setScreens((prev) =>
        prev.map((screen) => ({
          ...screen,
          elements: screen.elements.filter((element) => element.id !== selected.id),
        })),
      );
      setSelectedId(null);
      return;
    }

    updateActiveScreen((screen) => ({
      ...screen,
      elements: screen.elements.filter((element) => element.id !== selected.id),
    }));

    setSelectedId(null);
  }

  function addScreen() {
    const next = createNewScreenFromCurrent(activeScreen, screens.length);
    setScreens((prev) => [...prev, next]);
    setActiveScreenId(next.id);
    setSelectedId(next.elements[0]?.id ?? null);
  }

  function addCommonBackground() {
    const existing = commonBackgroundLayer;
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    const maxZ = activeScreen.elements.length > 0 ? Math.max(...activeScreen.elements.map((el) => el.zIndex)) : 0;
    const newElement = createCommonBackgroundElement(maxZ + 1, activeScreen.canvas);

    setScreens((prev) =>
      prev.map((screen) => ({
        ...screen,
        elements: [
          ...screen.elements,
          {
            ...newElement,
            width: screen.canvas.width,
            height: screen.canvas.height,
          },
        ],
      })),
    );
    setSelectedId(newElement.id);
  }

  function removeActiveScreen() {
    if (screens.length <= 1) {
      setMessage({ text: "At least one screen is required.", tone: "error" });
      return;
    }

    const remaining = screens.filter((screen) => screen.id !== activeScreen.id);
    setScreens(remaining);
    setActiveScreenId(remaining[0].id);
    setSelectedId(remaining[0].elements[0]?.id ?? null);
  }

  function enableSharedDeviceAcrossNextScreen() {
    if (!selected || !(selected.kind === "DEVICE_SCREENSHOT_SLOT" || selected.data.deviceType === "iphone")) return;
    if (activeScreenIndex >= screens.length - 1) {
      setMessage({ text: "Need a next screen to span device across 2 screens.", tone: "error" });
      return;
    }

    const pairId = selected.data.sharedDevicePairId || crypto.randomUUID();
    const startIndex = activeScreenIndex;
    const nextScreen = screens[startIndex + 1];
    if (!nextScreen) return;

    setScreens((prev) =>
      prev.map((screen, index) => {
        if (index === startIndex) {
          return {
            ...screen,
            elements: screen.elements.map((element) =>
              element.id === selected.id
                ? {
                    ...element,
                    data: {
                      ...element.data,
                      sharedDevicePairId: pairId,
                      sharedDeviceStartIndex: startIndex,
                      sharedDeviceSpanWidth: activeScreen.canvas.width,
                    },
                  }
                : element,
            ),
          };
        }

        if (index === startIndex + 1) {
          const withoutOldPair = screen.elements.filter((element) => element.data.sharedDevicePairId !== pairId);
          const sibling: EditorElement = {
            ...selected,
            id: crypto.randomUUID(),
            data: {
              ...selected.data,
              sharedDevicePairId: pairId,
              sharedDeviceStartIndex: startIndex,
              sharedDeviceSpanWidth: activeScreen.canvas.width,
            },
          };
          return {
            ...screen,
            elements: [...withoutOldPair, sibling],
          };
        }

        return screen;
      }),
    );

    setMessage({ text: "Device now spans this and next screen.", tone: "success" });
  }

  function disableSharedDeviceAcrossScreens() {
    if (!selected || !isSharedDeviceElement(selected)) return;
    const pairId = selected.data.sharedDevicePairId;
    const startIndex = selected.data.sharedDeviceStartIndex;
    if (!pairId || typeof startIndex !== "number") return;

    setScreens((prev) =>
      prev.map((screen, index) => {
        if (index === startIndex) {
          return {
            ...screen,
            elements: screen.elements.map((element) =>
              element.data.sharedDevicePairId === pairId
                ? {
                    ...element,
                    data: {
                      ...element.data,
                      sharedDevicePairId: undefined,
                      sharedDeviceStartIndex: undefined,
                      sharedDeviceSpanWidth: undefined,
                    },
                  }
                : element,
            ),
          };
        }

        if (index === startIndex + 1) {
          return {
            ...screen,
            elements: screen.elements.filter((element) => element.data.sharedDevicePairId !== pairId),
          };
        }

        return screen;
      }),
    );

    setMessage({ text: "2-screen span removed from device.", tone: "success" });
  }

  function applyDevicePreset(presetId: string) {
    if (presetId === "custom") return;
    const preset = DEVICE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    const shouldEnsureIphoneDevice = isIphonePresetId(preset.id);
    const existingIphoneDevice = activeScreen.elements.find(
      (element) => element.kind === "DEVICE_SCREENSHOT_SLOT" || element.data.deviceType === "iphone",
    );
    const activeMaxZ = activeScreen.elements.length > 0 ? Math.max(...activeScreen.elements.map((el) => el.zIndex)) : 0;
    const newDeviceElementForActive =
      shouldEnsureIphoneDevice && !existingIphoneDevice
        ? createCustomElement("DEVICE_SCREENSHOT_SLOT", activeMaxZ + 1, {
            width: preset.width,
            height: preset.height,
          })
        : null;

    const linkedScreenIds = new Set<string>();
    for (const element of activeScreen.elements) {
      if (!isSharedDeviceElement(element)) continue;
      const startIndex = element.data.sharedDeviceStartIndex;
      if (typeof startIndex !== "number") continue;

      if (activeScreenIndex === startIndex) {
        const next = screens[startIndex + 1];
        if (next) linkedScreenIds.add(next.id);
      } else if (activeScreenIndex === startIndex + 1) {
        const start = screens[startIndex];
        if (start) linkedScreenIds.add(start.id);
      }
    }

    setScreens((prev) => {
      const indexById = new Map(prev.map((screen, index) => [screen.id, index]));

      return prev.map((screen) => {
        const shouldResize = screen.id === activeScreen.id || linkedScreenIds.has(screen.id);
        if (!shouldResize) return screen;

        const screenIndex = indexById.get(screen.id) ?? 0;
        const scaleX = preset.width / screen.canvas.width;
        const scaleY = preset.height / screen.canvas.height;
        const isActive = screen.id === activeScreen.id;

        return {
          ...screen,
          canvas: {
            ...screen.canvas,
            width: preset.width,
            height: preset.height,
          },
          elements: [
            ...screen.elements.map((element) => ({
              ...element,
              x: Math.round(element.x * scaleX),
              y: Math.round(element.y * scaleY),
              width: Math.max(20, Math.round(element.width * scaleX)),
              height: Math.max(20, Math.round(element.height * scaleY)),
              data:
                element.kind === "DEVICE_SCREENSHOT_SLOT" || element.data.deviceType === "iphone"
                  ? {
                      ...element.data,
                      deviceType: "iphone" as const,
                      deviceBackgroundColor: element.data.deviceBackgroundColor || "#0b1020",
                      deviceMaskFillAssetUrl: element.data.deviceMaskFillAssetUrl || null,
                      deviceScreenOffsetX: element.data.deviceScreenOffsetX || 0,
                      deviceScreenOffsetY: element.data.deviceScreenOffsetY || 0,
                      deviceScreenScale: element.data.deviceScreenScale || 1,
                      deviceMaskOffsetX: element.data.deviceMaskOffsetX || 0,
                      deviceMaskOffsetY: element.data.deviceMaskOffsetY || 0,
                      deviceMaskScale: element.data.deviceMaskScale || 1,
                      sharedDeviceSpanWidth:
                        element.data.sharedDevicePairId && element.data.sharedDeviceStartIndex === screenIndex
                          ? preset.width
                          : element.data.sharedDeviceSpanWidth,
                    }
                  : element.data,
            })),
            ...(isActive && newDeviceElementForActive ? [newDeviceElementForActive] : []),
          ],
        };
      });
    });

    if (shouldEnsureIphoneDevice) {
      setSelectedId(existingIphoneDevice?.id || newDeviceElementForActive?.id || null);
    }
  }

  async function saveAllScreens() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProjectEditorStateAction({
        projectId,
        screens,
      });

      if (!result.ok) {
        setMessage({ text: result.error || "Save failed.", tone: "error" });
        return;
      }

      setMessage({ text: "All screens saved.", tone: "success" });
    });
  }

  function startProjectNameEdit() {
    setProjectNameDraft(projectName);
    setEditingProjectName(true);
    setMessage(null);
  }

  function cancelProjectNameEdit() {
    setProjectNameDraft(projectName);
    setEditingProjectName(false);
  }

  function submitProjectName(nextName: string) {
    const trimmed = nextName.trim();
    if (trimmed.length < 2) {
      setMessage({ text: "Project name must be at least 2 characters.", tone: "error" });
      return;
    }

    if (trimmed === projectName) {
      setEditingProjectName(false);
      return;
    }

    startNameTransition(async () => {
      const result = await updateProjectNameAction({
        projectId,
        name: trimmed,
      });

      if (!result.ok) {
        setMessage({ text: result.error || "Failed to update project name.", tone: "error" });
        return;
      }

      setProjectName(trimmed);
      setProjectNameDraft(trimmed);
      setEditingProjectName(false);
      setMessage({ text: "Project name updated.", tone: "success" });
    });
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("type", "USER_UPLOAD");
    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Image upload failed.");

    const payload = (await response.json()) as { fileUrl: string };
    updateSelectedData("assetUrl", payload.fileUrl);
  }

  async function exportScreenByServer(screen: EditorScreen) {
    type ExportApiPayload = {
      ok?: boolean;
      error?: string;
      warning?: string;
      outputUrl?: string;
      details?: string;
    };

    const response = await fetch(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        screenId: screen.id,
        label: screen.name,
        format: exportFormat,
        quality: exportFormat === "PNG" ? undefined : exportQuality,
        scale: 1,
      }),
    });

    const rawText = await response.text().catch(() => "");
    let payload: ExportApiPayload | null = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText) as ExportApiPayload;
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const parsedError = [payload?.error, payload?.details].filter(Boolean).join(" | ") || rawText;
      throw new Error(
        `Export API failed (${response.status}${response.statusText ? ` ${response.statusText}` : ""})${
          parsedError ? `: ${parsedError}` : ""
        }`,
      );
    }

    if (payload && payload.ok === false) {
      throw new Error(payload.error || "Export API returned ok=false.");
    }

    if (!payload?.outputUrl && !payload?.warning) {
      throw new Error("Export API returned no output URL.");
    }

    if (payload?.outputUrl) {
      const extension = exportFormat === "JPG" ? "jpg" : exportFormat === "WEBP" ? "webp" : "png";
      downloadFile(payload.outputUrl, `${sanitizeFilePart(screen.name)}.${extension}`);
    }

    return payload?.warning || null;
  }

  async function exportCurrent() {
    try {
      setMessage(null);

      const saveResult = await saveProjectEditorStateAction({
        projectId,
        screens,
      });
      if (!saveResult.ok) {
        throw new Error(saveResult.error || "Save before export failed.");
      }

      let warning: string | null = null;
      try {
        warning = await exportScreenByServer(activeScreen);
      } catch (error) {
        throw new Error(`Server export failed: ${formatExportError(error, "export error")}`);
      }

      if (warning) {
        setMessage({ text: warning, tone: "warning" });
      } else {
        setMessage({ text: "Current screen exported.", tone: "success" });
      }
    } catch (error) {
      const text = formatExportError(error, "Export failed");
      console.error("Export current failed:", error);
      setMessage({ text, tone: "error" });
    }
  }

  async function bulkExport() {
    setBulkExporting(true);
    setMessage(null);

    try {
      const saveResult = await saveProjectEditorStateAction({
        projectId,
        screens,
      });
      if (!saveResult.ok) {
        throw new Error(saveResult.error || "Save before export failed.");
      }

      const warnings: string[] = [];

      for (const screen of screens) {
        const warning = await exportScreenByServer(screen);
        if (warning) {
          warnings.push(`${screen.name}: ${warning}`);
        }
      }

      if (warnings.length > 0) {
        setMessage({ text: `Bulk export complete with warnings: ${warnings.join(" | ")}`, tone: "warning" });
      } else {
        setMessage({ text: "Bulk export complete.", tone: "success" });
      }
    } catch (error) {
      const text = formatExportError(error, "Bulk export failed");
      console.error("Bulk export failed:", error);
      setMessage({ text, tone: "error" });
    } finally {
      setBulkExporting(false);
    }
  }

  const presetId = findDevicePreset(activeScreen.canvas.width, activeScreen.canvas.height)?.id || "custom";

  return (
    <div className="space-y-4">
      <div className="flex min-h-10 items-center gap-2">
        {editingProjectName ? (
          <Input
            value={projectNameDraft}
            onChange={(event) => setProjectNameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitProjectName(projectNameDraft);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelProjectNameEdit();
              }
            }}
            onBlur={() => submitProjectName(projectNameDraft)}
            autoFocus
            disabled={namePending}
            className="h-12 max-w-2xl text-3xl text-slate-900"
          />
        ) : (
          <button
            type="button"
            onClick={startProjectNameEdit}
            className="rounded-md px-1 text-left text-3xl text-slate-900 transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Edit project name"
            title="Click to edit project name"
          >
            {projectName}
          </button>
        )}
      </div>

      <div className="grid h-[calc(100vh-260px)] min-h-0 min-w-0 gap-4 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Project Editor</h2>

        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Screens</p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="border border-slate-200 px-2 py-1 text-xs" onClick={addScreen}>
                Add
              </Button>
              <Button type="button" variant="ghost" className="border border-slate-200 px-2 py-1 text-xs" onClick={removeActiveScreen}>
                Remove
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => {
                  setActiveScreenId(screen.id);
                  setSelectedId(screen.elements[0]?.id ?? null);
                }}
                className={`min-w-[110px] rounded-md border px-2 py-2 text-left text-xs ${
                  screen.id === activeScreen.id
                    ? "border-amber-300 bg-amber-100 text-slate-900"
                    : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                {screen.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={() => addOverlay("TEXT")}>Add Text</Button>
          <Button type="button" variant="secondary" onClick={() => addOverlay("IMAGE")}>Add Graphic</Button>
          <Button type="button" variant="ghost" className="border border-slate-200" onClick={addCommonBackground}>
            {commonBackgroundLayer ? "Select Common BG" : "Add Common BG"}
          </Button>
          <Button type="button" variant="ghost" className="border border-slate-200" onClick={() => addOverlay("DEVICE_SCREENSHOT_SLOT")}>
            Add Device
          </Button>
        </div>

        <label className="block text-xs font-medium text-slate-700">
          Device Preset
          <select
            value={presetId}
            onChange={(event) => applyDevicePreset(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="custom">Custom</option>
            {DEVICE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} ({preset.width} x {preset.height})
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-slate-500">Canvas: {activeScreen.canvas.width} x {activeScreen.canvas.height}</p>

        {selected ? (
          <div className="space-y-3 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Selected: {selected.name}</p>
            {isCommonBackgroundElement(selected) ? (
              <p className="text-xs font-medium text-amber-700">Common background layer (shared across all screens)</p>
            ) : null}
            <p className="text-xs text-slate-600">{canEdit(selected) ? "Editable" : "Locked by template"}</p>

            {canEdit(selected) ? (
              <label className="block text-xs font-medium text-slate-700">
                Layer name
                <Input
                  value={selected.name}
                  onChange={(event) => updateElement(selected.id, { name: event.target.value })}
                  className="mt-1"
                />
              </label>
            ) : null}

            {selected.kind === "TEXT" && canEdit(selected) ? (
              <>
                <label className="block text-xs font-medium text-slate-700">
                  Text
                  <Input
                    value={selected.data.text || ""}
                    onChange={(event) => updateSelectedData("text", event.target.value)}
                    className="mt-1"
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block text-xs font-medium text-slate-700">
                    Font
                    <select
                      value={selected.data.fontFamily || "space"}
                      onChange={(event) => updateSelectedData("fontFamily", event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs"
                    >
                      {FONT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">
                    Font size
                    <Input
                      type="number"
                      min={8}
                      max={400}
                      value={selected.data.fontSize || 32}
                      onChange={(event) =>
                        updateSelectedData("fontSize", Math.max(8, Math.min(400, Number(event.target.value || 32))))
                      }
                      className="mt-1"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-700">
                    Text color
                    <Input
                      type="color"
                      value={selected.data.color || "#0f172a"}
                      onChange={(event) => updateSelectedData("color", event.target.value)}
                      className="mt-1 h-10"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selected.data.fontStyle === "normal" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => updateSelectedData("fontStyle", "normal")}
                  >
                    Normal
                  </Button>
                  <Button
                    type="button"
                    variant={selected.data.fontWeight === "bold" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => updateSelectedData("fontWeight", "bold")}
                  >
                    Bold
                  </Button>
                  <Button
                    type="button"
                    variant={selected.data.fontStyle === "italic" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => updateSelectedData("fontStyle", "italic")}
                  >
                    Italic
                  </Button>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-700">Text alignment</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TEXT_ALIGN_OPTIONS.map((align) => (
                      <Button
                        key={align}
                        type="button"
                        variant={(selected.data.align || "left") === align ? "primary" : "ghost"}
                        className="border border-slate-200 px-2 py-1 text-xs capitalize"
                        onClick={() => updateSelectedData("align", align)}
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {(selected.kind === "IMAGE" || selected.kind === "DEVICE_SCREENSHOT_SLOT") && canEdit(selected) ? (
              <div className="space-y-2">
                {selected.kind === "IMAGE" ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700">
                      Choose existing background
                      <div className="mt-1">
                        <BackgroundImagePicker
                          items={availableImageOptions}
                          value={selected.data.assetUrl || ""}
                          onChange={(nextValue) => updateSelectedData("assetUrl", nextValue)}
                        />
                      </div>
                    </label>
                    {selected.data.assetUrl ? (
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <p className="mb-2 text-[11px] font-medium text-slate-600">Selected background preview</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selected.data.assetUrl}
                          alt="Selected background preview"
                          className="h-24 w-full rounded object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <label className="block text-xs font-medium text-slate-700">
                  Replace image
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadImage(file);
                      }
                    }}
                  />
                </label>
              </div>
            ) : null}

            {(selected.kind === "DEVICE_SCREENSHOT_SLOT" || selected.data.deviceType === "iphone") && canEdit(selected) ? (
              <div className="space-y-3 rounded-md border border-slate-200 p-2">
                <p className="text-xs font-medium text-slate-700">Device layer edit mode</p>
                <div className="grid grid-cols-1 gap-2">
                  {!isSharedDeviceElement(selected) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-slate-200 px-2 py-1 text-xs"
                      onClick={enableSharedDeviceAcrossNextScreen}
                      disabled={activeScreenIndex >= screens.length - 1}
                    >
                      Span Across Next Screen
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-slate-200 px-2 py-1 text-xs"
                      onClick={disableSharedDeviceAcrossScreens}
                    >
                      Remove 2-Screen Span
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={deviceLayerTarget === "frame" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => setDeviceLayerTarget("frame")}
                  >
                    Frame
                  </Button>
                  <Button
                    type="button"
                    variant={deviceLayerTarget === "screen" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => setDeviceLayerTarget("screen")}
                  >
                    Inner image
                  </Button>
                  <Button
                    type="button"
                    variant={deviceLayerTarget === "background" ? "primary" : "ghost"}
                    className="border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => setDeviceLayerTarget("background")}
                  >
                    Mask bg
                  </Button>
                </div>

                <label className="block text-xs font-medium text-slate-700">
                  Device background color
                  <Input
                    type="color"
                    value={selected.data.deviceBackgroundColor || "#0b1020"}
                    onChange={(event) => updateSelectedData("deviceBackgroundColor", event.target.value)}
                    className="mt-1 h-10"
                  />
                </label>

                {deviceLayerTarget === "screen" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block text-xs font-medium text-slate-700">
                      X
                      <Input
                        type="number"
                        value={selected.data.deviceScreenOffsetX || 0}
                        onChange={(event) => updateSelectedData("deviceScreenOffsetX", Number(event.target.value || 0))}
                        className="mt-1"
                      />
                    </label>
                    <label className="block text-xs font-medium text-slate-700">
                      Y
                      <Input
                        type="number"
                        value={selected.data.deviceScreenOffsetY || 0}
                        onChange={(event) => updateSelectedData("deviceScreenOffsetY", Number(event.target.value || 0))}
                        className="mt-1"
                      />
                    </label>
                    <label className="block text-xs font-medium text-slate-700">
                      Scale
                      <Input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={selected.data.deviceScreenScale || 1}
                        onChange={(event) =>
                          updateSelectedData("deviceScreenScale", Math.max(0.1, Number(event.target.value || 1)))
                        }
                        className="mt-1"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}

            {selected.source === "custom" ? (
              <Button type="button" variant="danger" className="w-full" onClick={deleteSelectedCustomElement}>
                Delete Custom Layer
              </Button>
            ) : null}
          </div>
        ) : null}

        <Button type="button" onClick={saveAllScreens} disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save Screens"}
        </Button>
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">Export options</p>
          <label className="block text-xs font-medium text-slate-700">
            Format
            <select
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value as ExportOutputFormat)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="PNG">PNG (lossless)</option>
              <option value="JPG">JPG (smaller file)</option>
              <option value="WEBP">WEBP (smaller file)</option>
            </select>
          </label>
          {exportFormat !== "PNG" ? (
            <label className="block text-xs font-medium text-slate-700">
              Quality ({exportQuality})
              <Input
                type="range"
                min={1}
                max={100}
                value={exportQuality}
                onChange={(event) => setExportQuality(Math.max(1, Math.min(100, Number(event.target.value || 82))))}
                className="mt-1"
              />
            </label>
          ) : (
            <p className="text-[11px] text-slate-500">PNG is lossless and ignores quality setting.</p>
          )}
        </div>
        <Button type="button" onClick={exportCurrent} variant="secondary" className="w-full">
          Export Current Screen
        </Button>
        <Button type="button" onClick={bulkExport} variant="secondary" className="w-full" disabled={bulkExporting}>
          {bulkExporting ? "Bulk exporting..." : "Bulk Export All Screens"}
        </Button>
        {message ? (
          <p
            className={`text-sm ${
              message.tone === "error"
                ? "text-rose-700"
                : message.tone === "warning"
                  ? "text-amber-700"
                  : "text-emerald-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </aside>

      <div ref={canvasWrapperRef} className="flex min-h-0 min-w-0 flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {screens.map((screen, screenIndex) => {
              const thumbScale = Math.min(160 / screen.canvas.width, 110 / screen.canvas.height, 1);
              const thumbOverlayElement = getSharedOverlayElement(screen);
              const thumbHiddenElementIds = hasCommonBackground
                ? screen.elements
                    .filter((element) => isFullCanvasImageLayer(element, screen.canvas) && !isCommonBackgroundElement(element))
                    .map((element) => element.id)
                : thumbOverlayElement
                  ? [thumbOverlayElement.id]
                  : undefined;
              return (
                <button
                  key={`thumb-${screen.id}`}
                  type="button"
                  onClick={() => {
                    setActiveScreenId(screen.id);
                    setSelectedId(screen.elements[0]?.id ?? null);
                  }}
                  className={`rounded-md border p-1 ${
                    screen.id === activeScreen.id
                      ? hasCommonBackground
                        ? "border-amber-400 bg-transparent"
                        : "border-amber-400 bg-amber-50"
                      : hasCommonBackground
                        ? "border-slate-200 bg-transparent"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <EditorCanvasStatic
                    canvas={screen.canvas}
                    elements={screen.elements}
                    scale={thumbScale}
                    canvasBackgroundColor={hasCommonBackground ? "transparent" : undefined}
                    containerClassName={hasCommonBackground ? "bg-transparent" : undefined}
                    hiddenElementIds={thumbHiddenElementIds}
                    commonBackgroundSpan={{
                      index: screenIndex,
                      total: Math.max(1, screens.length),
                      segmentGapX: 20 / thumbScale,
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant={screenViewMode === "single" ? "primary" : "ghost"}
              className="border border-slate-200 px-2 py-1 text-xs"
              onClick={() => setScreenViewMode("single")}
            >
              Single
            </Button>
            <Button
              type="button"
              variant={screenViewMode === "list" ? "primary" : "ghost"}
              className="border border-slate-200 px-2 py-1 text-xs"
              onClick={() => setScreenViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {screenViewMode === "single" ? (
            <EditorCanvasStage
              rootId={`editor-canvas-root-${activeScreen.id}`}
              canvas={activeScreen.canvas}
              elements={singleModeElements}
              selectedId={selectedId}
              deviceLayerTarget={deviceLayerTarget}
              canTransform={canEdit}
              onSelect={setSelectedId}
              onUpdate={updateElement}
              onUpdateData={updateElementData}
              commonBackgroundSpan={{
                index: activeScreenIndex >= 0 ? activeScreenIndex : 0,
                total: Math.max(1, screens.length),
              }}
              frameBackgroundClassName={hasCommonBackground ? "bg-transparent" : undefined}
              canvasBackgroundColor={hasCommonBackground ? "transparent" : undefined}
            />
          ) : (
            <div className="relative h-full overflow-x-auto rounded-xl border border-slate-300 bg-slate-100 p-3">
            <div className="pointer-events-none absolute inset-0 z-0">
              {!hasCommonBackground && sharedOverlayAssetUrl ? (
                <div
                  className="h-full w-full bg-cover bg-center opacity-35"
                  style={{ backgroundImage: `url(${sharedOverlayAssetUrl})` }}
                />
              ) : !hasCommonBackground ? (
                <div
                  className="h-full w-full opacity-50"
                  style={{
                    background: `linear-gradient(120deg, ${activeScreen.canvas.backgroundColor} 0%, #e2e8f0 100%)`,
                  }}
                />
              ) : null}
            </div>
            <div className="relative z-10 flex w-max min-w-max gap-3">
              {screens.map((screen, screenIndex) => {
                const cardScale = Math.min(420 / screen.canvas.width, 420 / screen.canvas.height, 1);
                const overlayElement = getSharedOverlayElement(screen);
                const listHiddenElementIds = hasCommonBackground
                  ? screen.elements
                      .filter((element) => isFullCanvasImageLayer(element, screen.canvas) && !isCommonBackgroundElement(element))
                      .map((element) => element.id)
                  : overlayElement
                    ? [overlayElement.id]
                    : undefined;
                return (
                  <div
                    key={`list-${screen.id}`}
                    onClick={() => {
                      setActiveScreenId(screen.id);
                      if (!screen.elements.some((element) => element.id === selectedId)) {
                        setSelectedId(screen.elements[0]?.id ?? null);
                      }
                    }}
                    className={`rounded-lg border p-2 text-left ${
                      hasCommonBackground ? "border-slate-200 bg-white/85" : "border-slate-200 bg-white/70"
                    }`}
                  >
                    <p className="mb-2 text-xs font-semibold text-slate-700">{screen.name}</p>
                    <EditorCanvasStatic
                      canvas={screen.canvas}
                      elements={screen.elements}
                      scale={cardScale}
                      containerClassName="bg-transparent"
                      canvasBackgroundColor="transparent"
                      hiddenElementIds={listHiddenElementIds}
                      selectedElementId={screen.id === activeScreen.id ? selectedId : null}
                      onElementSelect={(elementId) => {
                        setActiveScreenId(screen.id);
                        setSelectedId(elementId);
                      }}
                      interactive
                      canTransform={canEdit}
                      onElementUpdate={updateElement}
                      commonBackgroundSpan={{
                        index: screenIndex,
                        total: Math.max(1, screens.length),
                        segmentGapX: 32 / cardScale,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>

      </div>
    </div>
    </div>
  );
}
