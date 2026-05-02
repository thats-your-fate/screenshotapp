"use client";

import { EditorCanvasStatic } from "@/components/editor/editor-canvas";
import type { EditorElement, EditorScreen } from "@/features/editor/types";

function isCommonBackgroundElement(element: EditorElement) {
  return element.kind === "IMAGE" && element.data.commonBackground === true;
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

export function TemplateListPreview({ screens }: { screens: EditorScreen[] }) {
  const safeScreens = screens.length > 0 ? screens : [];
  const hasCommonBackground = safeScreens
    .flatMap((screen) => screen.elements)
    .some((element) => isCommonBackgroundElement(element) && !!element.data.assetUrl);

  if (safeScreens.length === 0) {
    return <div className="h-24 rounded-lg border border-slate-200 bg-slate-100" />;
  }

  const baseScreen = safeScreens[0];
  const sharedOverlayAssetUrl = getSharedOverlayElement(baseScreen)?.data.assetUrl ?? null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3">
      <div className="pointer-events-none absolute inset-0 z-0">
        {!hasCommonBackground && sharedOverlayAssetUrl ? (
          <div className="h-full w-full bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${sharedOverlayAssetUrl})` }} />
        ) : !hasCommonBackground ? (
          <div
            className="h-full w-full opacity-50"
            style={{
              background: `linear-gradient(120deg, ${baseScreen.canvas.backgroundColor} 0%, #e2e8f0 100%)`,
            }}
          />
        ) : null}
      </div>

      <div className="relative z-10 flex w-max min-w-full gap-3 overflow-x-auto pb-1">
        {safeScreens.map((screen, index) => {
          const scale = Math.min(190 / screen.canvas.width, 230 / screen.canvas.height, 1);
          const hiddenElementIds = hasCommonBackground
            ? screen.elements
                .filter((element) => isFullCanvasImageLayer(element, screen.canvas) && !isCommonBackgroundElement(element))
                .map((element) => element.id)
            : undefined;

          return (
            <div key={screen.id} className="rounded-md border border-slate-200 bg-white/85 p-1">
              <EditorCanvasStatic
                canvas={screen.canvas}
                elements={screen.elements}
                scale={scale}
                containerClassName="bg-transparent"
                canvasBackgroundColor="transparent"
                hiddenElementIds={hiddenElementIds}
                commonBackgroundSpan={{
                  index,
                  total: Math.max(1, safeScreens.length),
                  segmentGapX: 24 / scale,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
