"use client";

import { useMemo, useState, useTransition } from "react";

import { EditorCanvasStage, EditorCanvasStatic } from "@/components/editor/editor-canvas";
import { BackgroundImagePicker } from "@/components/editor/background-image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FONT_OPTIONS } from "@/features/editor/fonts";
import type { EditorElement, EditorScreen } from "@/features/editor/types";
import { saveTemplateElementsAction } from "@/features/templates/actions";

const TEXT_ALIGN_OPTIONS = ["left", "center", "right"] as const;

function createElement(
  kind: "TEXT" | "IMAGE" | "DEVICE_SCREENSHOT_SLOT",
  zIndex: number,
  canvas: { width: number; height: number },
): EditorElement {
  const id = crypto.randomUUID();

  if (kind === "TEXT") {
    return {
      id,
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
    const deviceHeight = Math.max(280, Math.round(canvas.height * 0.94));
    const deviceWidth = Math.max(120, Math.round((deviceHeight * 1170) / 2532));

    return {
      id,
      kind,
      name: "iPhone Device",
      zIndex,
      x: Math.round((canvas.width - deviceWidth) / 2),
      y: Math.round((canvas.height - deviceHeight) / 2),
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

function createCommonBackgroundElement(canvas: { width: number; height: number }, zIndex: number): EditorElement {
  return {
    id: crypto.randomUUID(),
    kind: "IMAGE",
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
      fit: "cover",
      placeholderLabel: "Upload shared background",
      commonBackground: true,
    },
  };
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

function createNewScreenFromCurrent(current: EditorScreen, index: number): EditorScreen {
  return {
    id: crypto.randomUUID(),
    name: `Screen ${index + 1}`,
    canvas: { ...current.canvas },
    elements: current.elements.map((element) => ({
      ...element,
      id: crypto.randomUUID(),
      data: {
        ...element.data,
        sharedDevicePairId: undefined,
        sharedDeviceStartIndex: undefined,
        sharedDeviceSpanWidth: undefined,
      },
    })),
  };
}

export function AdminTemplateEditor({
  templateId,
  canvasWidth,
  canvasHeight,
  initialBackgroundColor,
  initialScreens,
  backgroundLibrary,
}: {
  templateId: string;
  canvasWidth: number;
  canvasHeight: number;
  initialBackgroundColor: string;
  initialScreens: EditorScreen[];
  backgroundLibrary: Array<{ url: string; label: string }>;
}) {
  const fallbackScreen = useMemo<EditorScreen>(
    () => ({
      id: "screen-1",
      name: "Screen 1",
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: initialBackgroundColor,
      },
      elements: [],
    }),
    [canvasWidth, canvasHeight, initialBackgroundColor],
  );

  const [screens, setScreens] = useState<EditorScreen[]>(initialScreens.length > 0 ? initialScreens : [fallbackScreen]);
  const [activeScreenId, setActiveScreenId] = useState((initialScreens[0] ?? fallbackScreen).id);
  const [selectedId, setSelectedId] = useState<string | null>((initialScreens[0] ?? fallbackScreen).elements[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  const [screenViewMode, setScreenViewMode] = useState<"single" | "list">("single");
  const [deviceLayerTarget, setDeviceLayerTarget] = useState<"frame" | "screen" | "background">("frame");

  const activeScreen = useMemo(
    () => screens.find((screen) => screen.id === activeScreenId) || screens[0] || fallbackScreen,
    [screens, activeScreenId, fallbackScreen],
  );
  const activeScreenIndex = useMemo(() => screens.findIndex((screen) => screen.id === activeScreen.id), [screens, activeScreen.id]);

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

  const backgroundColor = activeScreen.canvas.backgroundColor;

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

  const sharedOverlayAssetUrl = useMemo(
    () => getSharedOverlayElement(screens[0] || fallbackScreen)?.data.assetUrl ?? null,
    [screens, fallbackScreen],
  );

  function canEdit(element: EditorElement) {
    return !element.locked;
  }

  function updateScreenById(screenId: string, mutator: (screen: EditorScreen) => EditorScreen) {
    setScreens((prev) => prev.map((screen) => (screen.id === screenId ? mutator(screen) : screen)));
  }

  function updateActiveScreen(mutator: (screen: EditorScreen) => EditorScreen) {
    updateScreenById(activeScreen.id, mutator);
  }

  function updateElementForScreen(screenId: string, id: string, patch: Partial<EditorElement>) {
    const screen = screens.find((item) => item.id === screenId);
    const target = screen?.elements.find((element) => element.id === id);
    const sharedPairId = target?.data.sharedDevicePairId;

    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
            isCommonBackgroundElement(element)
              ? {
                  ...element,
                  ...patch,
                }
              : element,
          ),
        })),
      );
      return;
    }

    if (sharedPairId) {
      setScreens((prev) =>
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
            element.data.sharedDevicePairId === sharedPairId ? { ...element, ...patch } : element,
          ),
        })),
      );
      return;
    }

    updateScreenById(screenId, (entry) => ({
      ...entry,
      elements: entry.elements.map((element) => (element.id === id ? { ...element, ...patch } : element)),
    }));
  }

  function updateElement(id: string, patch: Partial<EditorElement>) {
    updateElementForScreen(activeScreen.id, id, patch);
  }

  function updateSelectedData(key: string, value: unknown) {
    if (!selectedId) return;

    const target = activeScreen.elements.find((element) => element.id === selectedId);
    const sharedPairId = target?.data.sharedDevicePairId;
    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
            isCommonBackgroundElement(element)
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
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
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

  function updateElementDataForScreen(screenId: string, id: string, patch: Partial<EditorElement["data"]>) {
    const screen = screens.find((item) => item.id === screenId);
    const target = screen?.elements.find((element) => element.id === id);
    const sharedPairId = target?.data.sharedDevicePairId;

    if (target && isCommonBackgroundElement(target)) {
      setScreens((prev) =>
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
            isCommonBackgroundElement(element)
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
        prev.map((entry) => ({
          ...entry,
          elements: entry.elements.map((element) =>
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

    updateScreenById(screenId, (entry) => ({
      ...entry,
      elements: entry.elements.map((element) =>
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

  function updateElementData(id: string, patch: Partial<EditorElement["data"]>) {
    updateElementDataForScreen(activeScreen.id, id, patch);
  }

  function addOverlay(kind: "TEXT" | "IMAGE" | "DEVICE_SCREENSHOT_SLOT") {
    const maxZ = activeScreen.elements.length > 0 ? Math.max(...activeScreen.elements.map((el) => el.zIndex)) : 0;
    const newElement = createElement(kind, maxZ + 1, activeScreen.canvas);

    updateActiveScreen((screen) => ({
      ...screen,
      elements: [...screen.elements, newElement],
    }));

    setSelectedId(newElement.id);
  }

  function addCommonBackground() {
    if (commonBackgroundLayer) {
      const existingOnActive = activeScreen.elements.find((element) => isCommonBackgroundElement(element));
      if (existingOnActive) {
        setSelectedId(existingOnActive.id);
      }
      return;
    }

    setScreens((prev) =>
      prev.map((screen) => {
        const maxZ = screen.elements.length > 0 ? Math.max(...screen.elements.map((el) => el.zIndex)) : 0;
        return {
          ...screen,
          elements: [...screen.elements, createCommonBackgroundElement(screen.canvas, maxZ + 1)],
        };
      }),
    );
  }

  function addScreen() {
    const next = createNewScreenFromCurrent(activeScreen, screens.length);
    setScreens((prev) => [...prev, next]);
    setActiveScreenId(next.id);
    setSelectedId(next.elements[0]?.id ?? null);
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

  function deleteSelectedElement() {
    if (!selected) return;

    updateActiveScreen((screen) => ({
      ...screen,
      elements: screen.elements.filter((element) => element.id !== selected.id),
    }));
    setSelectedId(null);
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

  function moveLayer(direction: "up" | "down") {
    if (!selected) return;
    updateActiveScreen((screen) => {
      const sorted = [...screen.elements].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((item) => item.id === selected.id);
      if (index < 0) return screen;
      const target = direction === "up" ? index + 1 : index - 1;
      if (target < 0 || target >= sorted.length) return screen;
      const currentZ = sorted[index].zIndex;
      sorted[index].zIndex = sorted[target].zIndex;
      sorted[target].zIndex = currentZ;
      return { ...screen, elements: [...sorted] };
    });
  }

  function saveTemplate() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveTemplateElementsAction({
        templateId,
        backgroundColor,
        screens,
      });

      if (!result.ok) {
        setMessage({ text: "Save failed.", tone: "error" });
        return;
      }

      setMessage({ text: "Template saved.", tone: "success" });
    });
  }

  return (
    <div className="grid h-[calc(100vh-220px)] min-h-0 min-w-0 gap-4 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Template Editor</h2>

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
          Background Color
          <Input
            type="color"
            value={backgroundColor}
            onChange={(event) => {
              const next = event.target.value;
              setScreens((prev) => prev.map((screen) => ({ ...screen, canvas: { ...screen.canvas, backgroundColor: next } })));
            }}
            className="mt-1 h-10"
          />
        </label>

        <p className="text-xs text-slate-500">Canvas: {activeScreen.canvas.width} x {activeScreen.canvas.height}</p>

        {selected ? (
          <div className="space-y-3 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Selected: {selected.name}</p>
            {isCommonBackgroundElement(selected) ? (
              <p className="text-xs font-medium text-amber-700">Common background layer (shared across template screens)</p>
            ) : null}
            <p className="text-xs text-slate-600">{canEdit(selected) ? "Editable" : "Locked"}</p>

            <label className="block text-xs font-medium text-slate-700">
              Layer name
              <Input
                value={selected.name}
                onChange={(event) => updateElement(selected.id, { name: event.target.value })}
                className="mt-1"
              />
            </label>

            {selected.kind === "TEXT" ? (
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

            {(selected.kind === "IMAGE" || selected.kind === "DEVICE_SCREENSHOT_SLOT") ? (
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

            {selected.kind === "DEVICE_SCREENSHOT_SLOT" ? (
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
                  <Button type="button" variant={deviceLayerTarget === "frame" ? "primary" : "ghost"} className="border border-slate-200 px-2 py-1 text-xs" onClick={() => setDeviceLayerTarget("frame")}>Frame</Button>
                  <Button type="button" variant={deviceLayerTarget === "screen" ? "primary" : "ghost"} className="border border-slate-200 px-2 py-1 text-xs" onClick={() => setDeviceLayerTarget("screen")}>Inner image</Button>
                  <Button type="button" variant={deviceLayerTarget === "background" ? "primary" : "ghost"} className="border border-slate-200 px-2 py-1 text-xs" onClick={() => setDeviceLayerTarget("background")}>Mask bg</Button>
                </div>
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={selected.locked} onChange={(event) => updateElement(selected.id, { locked: event.target.checked })} />
              Locked
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={selected.editableByUser} onChange={(event) => updateElement(selected.id, { editableByUser: event.target.checked })} />
              Editable by user
            </label>

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" className="border border-slate-200" onClick={() => moveLayer("up")}>Layer Up</Button>
              <Button type="button" variant="ghost" className="border border-slate-200" onClick={() => moveLayer("down")}>Layer Down</Button>
            </div>

            <Button type="button" variant="danger" className="w-full" onClick={deleteSelectedElement}>Delete Layer</Button>
          </div>
        ) : null}

        <Button type="button" onClick={saveTemplate} disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save Template"}
        </Button>
        {message ? (
          <p className={`text-sm ${message.tone === "error" ? "text-rose-700" : "text-emerald-700"}`}>{message.text}</p>
        ) : null}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col">
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
            <Button type="button" variant={screenViewMode === "single" ? "primary" : "ghost"} className="border border-slate-200 px-2 py-1 text-xs" onClick={() => setScreenViewMode("single")}>Single</Button>
            <Button type="button" variant={screenViewMode === "list" ? "primary" : "ghost"} className="border border-slate-200 px-2 py-1 text-xs" onClick={() => setScreenViewMode("list")}>List</Button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {screenViewMode === "single" ? (
            <EditorCanvasStage
              rootId={`template-canvas-root-${activeScreen.id}`}
              canvas={activeScreen.canvas}
              elements={singleModeElements}
              selectedId={selectedId}
              deviceLayerTarget={deviceLayerTarget}
              canTransform={canEdit}
              onSelect={setSelectedId}
              onUpdate={updateElement}
              onUpdateData={updateElementData}
              commonBackgroundSpan={{ index: activeScreenIndex >= 0 ? activeScreenIndex : 0, total: Math.max(1, screens.length) }}
              frameBackgroundClassName={hasCommonBackground ? "bg-transparent" : undefined}
              canvasBackgroundColor={hasCommonBackground ? "transparent" : undefined}
            />
          ) : (
            <div className="relative h-full overflow-x-auto rounded-xl border border-slate-300 bg-slate-100 p-3">
              <div className="pointer-events-none absolute inset-0 z-0">
                {!hasCommonBackground && sharedOverlayAssetUrl ? (
                  <div className="h-full w-full bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${sharedOverlayAssetUrl})` }} />
                ) : !hasCommonBackground ? (
                  <div className="h-full w-full opacity-50" style={{ background: `linear-gradient(120deg, ${activeScreen.canvas.backgroundColor} 0%, #e2e8f0 100%)` }} />
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
                      className={`rounded-lg border p-2 text-left ${hasCommonBackground ? "border-slate-200 bg-white/85" : "border-slate-200 bg-white/70"}`}
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
                        onElementUpdate={(elementId, patch) => updateElementForScreen(screen.id, elementId, patch)}
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
  );
}
