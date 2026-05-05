"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Rnd } from "react-rnd";

import { resolveFontFamily } from "@/features/editor/fonts";
import type { EditorCanvas, EditorElement } from "@/features/editor/types";

const IPHONE_FRAME_SVG_PATH = "/devices/iphone-frame.svg";
const IPHONE_SCREEN_MASK_SVG_PATH = "/devices/iphone-screen-mask.svg";
type DeviceLayerTarget = "frame" | "screen" | "background";
type CommonBackgroundSpan = { index: number; total: number; segmentGapX?: number };

function isCommonBackgroundElement(element: EditorElement) {
  return element.kind === "IMAGE" && element.data.commonBackground === true;
}

function compareElementsForRender(a: EditorElement, b: EditorElement) {
  const aPriority = isCommonBackgroundElement(a) ? -1 : 0;
  const bPriority = isCommonBackgroundElement(b) ? -1 : 0;
  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  return a.zIndex - b.zIndex;
}

function normalizeAngleDelta(angle: number) {
  let normalized = angle;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function isIphoneDeviceElement(element: EditorElement) {
  return element.kind === "DEVICE_SCREENSHOT_SLOT" || element.data.deviceType === "iphone";
}

function getSharedDeviceRenderX(
  element: EditorElement,
  canvas: EditorCanvas,
  commonBackgroundSpan?: CommonBackgroundSpan,
) {
  if (!isIphoneDeviceElement(element)) return element.x;
  if (!element.data.sharedDevicePairId) return element.x;
  if (typeof element.data.sharedDeviceStartIndex !== "number") return element.x;
  if (!commonBackgroundSpan) return element.x;

  const start = element.data.sharedDeviceStartIndex;
  const current = commonBackgroundSpan.index;
  // Keep span width synced with the active canvas size so preset changes do not
  // leave paired segments with stale geometry.
  const spanWidth = canvas.width;
  const segmentGapX = commonBackgroundSpan.segmentGapX || 0;
  if (current === start) return element.x;
  if (current === start + 1) return element.x - spanWidth - segmentGapX;
  return null;
}

function getSharedDeviceRenderY(
  element: EditorElement,
  commonBackgroundSpan?: CommonBackgroundSpan,
) {
  if (!isIphoneDeviceElement(element)) return element.y;
  if (!element.data.sharedDevicePairId) return element.y;
  if (typeof element.data.sharedDeviceStartIndex !== "number") return element.y;
  if (!commonBackgroundSpan) return element.y;

  const start = element.data.sharedDeviceStartIndex;
  const current = commonBackgroundSpan.index;
  if (current === start) return element.y;
  if (current === start + 1) return element.y;
  return element.y;
}

function renderIphoneDeviceContent({
  element,
  editable,
  selected,
  canvasScale,
  deviceLayerTarget,
  onUpdateData,
}: {
  element: EditorElement;
  editable: boolean;
  selected: boolean;
  canvasScale: number;
  deviceLayerTarget: DeviceLayerTarget;
  onUpdateData: (id: string, patch: Partial<EditorElement["data"]>) => void;
}) {
  const imageUrl = element.data.assetUrl || null;
  const backgroundImageUrl = element.data.deviceMaskFillAssetUrl || null;
  const screenOffsetX = element.data.deviceScreenOffsetX || 0;
  const screenOffsetY = element.data.deviceScreenOffsetY || 0;
  const screenScale = element.data.deviceScreenScale || 1;
  const maskOffsetX = element.data.deviceMaskOffsetX || 0;
  const maskOffsetY = element.data.deviceMaskOffsetY || 0;
  const maskScale = element.data.deviceMaskScale || 1;

  const canEditScreenLayer = editable && selected && deviceLayerTarget === "screen";
  const canEditBackgroundLayer = editable && selected && deviceLayerTarget === "background";
  const baseWidth = Math.max(1, element.width);
  const baseHeight = Math.max(1, element.height);
  const bgWidth = Math.max(1, baseWidth * maskScale);
  const bgHeight = Math.max(1, baseHeight * maskScale);
  const bgX = (baseWidth - bgWidth) / 2 + maskOffsetX;
  const bgY = (baseHeight - bgHeight) / 2 + maskOffsetY;
  const screenWidth = Math.max(1, baseWidth * screenScale);
  const screenHeight = Math.max(1, baseHeight * screenScale);
  const screenX = (baseWidth - screenWidth) / 2 + screenOffsetX;
  const screenY = (baseHeight - screenHeight) / 2 + screenOffsetY;

  return (
    <div className="relative h-full w-full overflow-visible">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: element.data.deviceBackgroundColor || "#0b1020",
          WebkitMaskImage: `url(${IPHONE_SCREEN_MASK_SVG_PATH})`,
          maskImage: `url(${IPHONE_SCREEN_MASK_SVG_PATH})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      >
        {canEditBackgroundLayer ? (
          <Rnd
            bounds="parent"
            scale={canvasScale}
            size={{ width: bgWidth, height: bgHeight }}
            position={{ x: bgX, y: bgY }}
            disableDragging={false}
            enableResizing={false}
            style={{
              outline: "2px solid #f59e0b",
            }}
            onDragStart={(event) => {
              event.stopPropagation();
            }}
            onDragStop={(_, data) => {
              const nextOffsetX = Math.round((data.x - (baseWidth - bgWidth) / 2) * 100) / 100;
              const nextOffsetY = Math.round((data.y - (baseHeight - bgHeight) / 2) * 100) / 100;
              onUpdateData(element.id, {
                deviceMaskOffsetX: nextOffsetX,
                deviceMaskOffsetY: nextOffsetY,
              });
            }}
          >
            {backgroundImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImageUrl}
                alt={`${element.name} background`}
                loading="eager"
                draggable={false}
                className="h-full w-full select-none"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: element.data.deviceBackgroundColor || "#0b1020" }} />
            )}
          </Rnd>
        ) : (
          <div
            className="absolute"
            style={{
              left: bgX,
              top: bgY,
              width: bgWidth,
              height: bgHeight,
            }}
          >
            {backgroundImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImageUrl}
                alt={`${element.name} background`}
                loading="eager"
                draggable={false}
                className="h-full w-full select-none"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: element.data.deviceBackgroundColor || "#0b1020" }} />
            )}
          </div>
        )}

        {canEditScreenLayer ? (
          <Rnd
            bounds="parent"
            scale={canvasScale}
            size={{ width: screenWidth, height: screenHeight }}
            position={{ x: screenX, y: screenY }}
            lockAspectRatio
            minWidth={Math.max(24, baseWidth * 0.2)}
            minHeight={Math.max(24, baseHeight * 0.2)}
            style={{
              outline: "2px solid #f59e0b",
            }}
            onDragStart={(event) => {
              event.stopPropagation();
            }}
            onResizeStart={(event) => {
              event.stopPropagation();
            }}
            onDragStop={(_, data) => {
              const nextOffsetX = Math.round((data.x - (baseWidth - screenWidth) / 2) * 100) / 100;
              const nextOffsetY = Math.round((data.y - (baseHeight - screenHeight) / 2) * 100) / 100;
              onUpdateData(element.id, {
                deviceScreenOffsetX: nextOffsetX,
                deviceScreenOffsetY: nextOffsetY,
              });
            }}
            onResizeStop={(_, __, ref, ___, pos) => {
              const nextWidth = Number(ref.style.width.replace("px", ""));
              const nextHeight = Number(ref.style.height.replace("px", ""));
              const nextScale = Math.max(0.1, Math.round((nextWidth / baseWidth) * 1000) / 1000);
              const nextOffsetX = Math.round((pos.x - (baseWidth - nextWidth) / 2) * 100) / 100;
              const nextOffsetY = Math.round((pos.y - (baseHeight - nextHeight) / 2) * 100) / 100;
              onUpdateData(element.id, {
                deviceScreenScale: nextScale,
                deviceScreenOffsetX: nextOffsetX,
                deviceScreenOffsetY: nextOffsetY,
              });
            }}
          >
            {imageUrl ? (
              // Keep raw img so editor and export renderer use the same DOM/image behavior.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={element.name}
                loading="eager"
                draggable={false}
                className="h-full w-full select-none"
                style={{ objectFit: element.data.fit || "cover" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-500 bg-slate-900 text-xs text-slate-200">
                {element.data.placeholderLabel || "Upload screenshot"}
              </div>
            )}
          </Rnd>
        ) : imageUrl ? (
          <div
            className="absolute"
            style={{
              left: screenX,
              top: screenY,
              width: screenWidth,
              height: screenHeight,
            }}
          >
            {/* Keep raw img so editor and export renderer use the same DOM/image behavior. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={element.name}
              loading="eager"
              draggable={false}
              className="h-full w-full select-none"
              style={{ objectFit: element.data.fit || "cover" }}
            />
          </div>
        ) : (
          <div
            className="absolute flex items-center justify-center border border-dashed border-slate-500 bg-slate-900 text-xs text-slate-200"
            style={{
              left: screenX,
              top: screenY,
              width: screenWidth,
              height: screenHeight,
            }}
          >
            {element.data.placeholderLabel || "Upload screenshot"}
          </div>
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IPHONE_FRAME_SVG_PATH}
        alt="iPhone frame"
        loading="eager"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </div>
  );
}

function renderElementContent({
  element,
  editable,
  selected,
  canvasScale,
  deviceLayerTarget,
  onUpdateData,
  commonBackgroundSpan,
}: {
  element: EditorElement;
  editable: boolean;
  selected: boolean;
  canvasScale: number;
  deviceLayerTarget: DeviceLayerTarget;
  onUpdateData: (id: string, patch: Partial<EditorElement["data"]>) => void;
  commonBackgroundSpan?: CommonBackgroundSpan;
}) {
  if (element.kind === "TEXT") {
    const fontSize = typeof element.data.fontSize === "number" ? element.data.fontSize : 32;
    const fontWeight = element.data.fontWeight || 700;
    const fontStyle = element.data.fontStyle || "normal";

    return (
      <div
        className="h-full w-full p-2"
        style={{
          color: element.data.color || "#0f172a",
          fontSize,
          fontWeight,
          fontStyle,
          fontFamily: resolveFontFamily(element.data.fontFamily),
          textAlign: element.data.align || "left",
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
        }}
      >
        {element.data.text || "Text"}
      </div>
    );
  }

  if (isIphoneDeviceElement(element)) {
    return renderIphoneDeviceContent({
      element,
      editable,
      selected,
      canvasScale,
      deviceLayerTarget,
      onUpdateData,
    });
  }

  const imageUrl = element.data.assetUrl || null;
  const renderAsPanorama =
    element.kind === "IMAGE" &&
    element.data.commonBackground === true &&
    !!imageUrl &&
    !!commonBackgroundSpan &&
    commonBackgroundSpan.total > 1;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: element.data.borderRadius || 0 }}>
      {imageUrl ? (
        // Keep raw img so editor and export renderer use the same DOM/image behavior.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={element.name}
          loading="eager"
          draggable={false}
          className={renderAsPanorama ? "h-full select-none" : "h-full w-full select-none"}
          style={
            renderAsPanorama
              ? {
                  objectFit: element.data.fit || "cover",
                  width: `${commonBackgroundSpan.total * 100}%`,
                  maxWidth: "none",
                  transform: `translateX(-${(commonBackgroundSpan.index * 100) / commonBackgroundSpan.total}%)`,
                  transformOrigin: "top left",
                }
              : { objectFit: element.data.fit || "cover" }
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-400 bg-slate-100 text-xs text-slate-500">
          {element.data.placeholderLabel || "Image placeholder"}
        </div>
      )}
    </div>
  );
}

export function EditorCanvasStage({
  canvas,
  elements,
  selectedId,
  deviceLayerTarget = "frame",
  canTransform,
  onSelect,
  onUpdate,
  onUpdateData,
  rootId = "export-canvas-root",
  hideSelection = false,
  commonBackgroundSpan,
  frameBackgroundClassName,
  canvasBackgroundColor,
}: {
  canvas: EditorCanvas;
  elements: EditorElement[];
  selectedId: string | null;
  deviceLayerTarget?: DeviceLayerTarget;
  canTransform: (element: EditorElement) => boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<EditorElement>) => void;
  onUpdateData: (id: string, patch: Partial<EditorElement["data"]>) => void;
  rootId?: string;
  hideSelection?: boolean;
  commonBackgroundSpan?: CommonBackgroundSpan;
  frameBackgroundClassName?: string;
  canvasBackgroundColor?: string;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    if (!frameRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setFrameSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });

    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    const maxW = Math.max(frameSize.width - 24, 1);
    const maxH = Math.max(frameSize.height - 24, 1);
    const wScale = maxW / canvas.width;
    const hScale = maxH / canvas.height;
    return Math.min(1, wScale, hScale);
  }, [canvas.width, canvas.height, frameSize.width, frameSize.height]);

  const scaledWidth = Math.max(1, Math.round(canvas.width * scale));
  const scaledHeight = Math.max(1, Math.round(canvas.height * scale));

  return (
    <div
      ref={frameRef}
      className={`h-full min-h-[420px] overflow-hidden rounded-xl border border-slate-300 p-3 ${
        frameBackgroundClassName ?? "bg-slate-200"
      }`}
    >
      <div className="h-full w-full overflow-auto">
        <div className="mx-auto" style={{ width: scaledWidth, height: scaledHeight }}>
          <div
            id={rootId}
            className="relative overflow-hidden"
            style={{
              width: canvas.width,
              height: canvas.height,
              backgroundColor: canvasBackgroundColor ?? canvas.backgroundColor,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {elements
              .filter((item) => item.visible)
              .sort(compareElementsForRender)
              .map((element) => {
                const isCommonBackground = isCommonBackgroundElement(element);
                const sharedDeviceRenderX = getSharedDeviceRenderX(element, canvas, commonBackgroundSpan);
                if (sharedDeviceRenderX === null) {
                  return null;
                }
                const renderX = isCommonBackground ? 0 : sharedDeviceRenderX;
                const renderY = isCommonBackground ? 0 : getSharedDeviceRenderY(element, commonBackgroundSpan);
                const renderWidth = isCommonBackground ? canvas.width : element.width;
                const renderHeight = isCommonBackground ? canvas.height : element.height;
                const renderZIndex = isCommonBackground ? -1 : element.zIndex;
                const editable = canTransform(element);
                const selected = selectedId === element.id;
                const editingInnerLayer = selected && isIphoneDeviceElement(element) && deviceLayerTarget !== "frame";
                const canMoveFrame = editable && !editingInnerLayer && !isCommonBackground;
                const canRotateFrame = editable && !isCommonBackground;
                return (
                  <Rnd
                    key={element.id}
                    scale={scale}
                    size={{ width: renderWidth, height: renderHeight }}
                    position={{ x: renderX, y: renderY }}
                    style={{
                      zIndex: renderZIndex,
                      opacity: element.opacity,
                      outline: !hideSelection && selected ? "2px solid #f59e0b" : "none",
                      background: "transparent",
                    }}
                    disableDragging={!canMoveFrame}
                    enableResizing={canMoveFrame}
                    onDragStart={() => onSelect(element.id)}
                    onResizeStart={() => onSelect(element.id)}
                    onDragStop={(_, data) => {
                      if (isCommonBackground) return;
                      onUpdate(element.id, { x: data.x, y: data.y });
                    }}
                    onResizeStop={(_, __, ref, ___, pos) => {
                      if (isCommonBackground) return;
                      onUpdate(element.id, {
                        x: pos.x,
                        y: pos.y,
                        width: Number(ref.style.width.replace("px", "")),
                        height: Number(ref.style.height.replace("px", "")),
                      });
                    }}
                    onClick={() => onSelect(element.id)}
                  >
                    <div
                      className="relative h-full w-full"
                      style={{
                        transform: `rotate(${element.rotation || 0}deg)`,
                        transformOrigin: "center",
                      }}
                    >
                      {selected && canRotateFrame ? (
                        <button
                          type="button"
                          aria-label="Rotate element"
                          className="absolute right-2 top-2 z-[999] h-11 w-11 cursor-grab rounded-full border-2 border-amber-700 bg-amber-100/95 text-xl font-bold leading-none text-amber-900 shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onSelect(element.id);
                            const targetRect = (
                              event.currentTarget.parentElement as HTMLDivElement | null
                            )?.getBoundingClientRect();
                            if (!targetRect) return;

                            const centerX = targetRect.left + targetRect.width / 2;
                            const centerY = targetRect.top + targetRect.height / 2;
                            const startPointerAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
                            const startRotation = element.rotation || 0;

                            const onMove = (moveEvent: PointerEvent) => {
                              const pointerAngle =
                                Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
                              const delta = normalizeAngleDelta(pointerAngle - startPointerAngle);
                              onUpdate(element.id, { rotation: Math.round((startRotation + delta) * 10) / 10 });
                            };

                            const onUp = () => {
                              window.removeEventListener("pointermove", onMove);
                              window.removeEventListener("pointerup", onUp);
                            };

                            window.addEventListener("pointermove", onMove);
                            window.addEventListener("pointerup", onUp);
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="mx-auto h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M21 2v6h-6" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 8a9 9 0 0 0-15-3" />
                            <path d="M3 16a9 9 0 0 0 15 3" />
                          </svg>
                        </button>
                      ) : null}
                      {renderElementContent({
                        element,
                        editable,
                        selected,
                        canvasScale: scale,
                        deviceLayerTarget,
                        onUpdateData,
                        commonBackgroundSpan,
                      })}
                    </div>
                  </Rnd>
                );
              })
              .filter(Boolean)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorCanvasStatic({
  canvas,
  elements,
  scale = 1,
  rootId,
  containerClassName,
  canvasBackgroundColor,
  hiddenElementIds,
  commonBackgroundSpan,
  selectedElementId,
  onElementSelect,
  interactive = false,
  canTransform,
  onElementUpdate,
}: {
  canvas: EditorCanvas;
  elements: EditorElement[];
  scale?: number;
  rootId?: string;
  containerClassName?: string;
  canvasBackgroundColor?: string;
  hiddenElementIds?: string[];
  commonBackgroundSpan?: CommonBackgroundSpan;
  selectedElementId?: string | null;
  onElementSelect?: (id: string) => void;
  interactive?: boolean;
  canTransform?: (element: EditorElement) => boolean;
  onElementUpdate?: (id: string, patch: Partial<EditorElement>) => void;
}) {
  const scaledWidth = Math.max(1, Math.round(canvas.width * scale));
  const scaledHeight = Math.max(1, Math.round(canvas.height * scale));
  const hiddenIds = useMemo(() => new Set(hiddenElementIds ?? []), [hiddenElementIds]);

  return (
    <div
      className={`overflow-hidden rounded-md border border-slate-200 bg-white ${containerClassName ?? ""}`}
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      <div
        id={rootId}
        className="relative overflow-hidden"
        style={{
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvasBackgroundColor ?? canvas.backgroundColor,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {elements
          .filter((item) => item.visible && !hiddenIds.has(item.id))
          .sort(compareElementsForRender)
          .map((element) => {
            const isCommonBackground = isCommonBackgroundElement(element);
            const sharedDeviceRenderX = getSharedDeviceRenderX(element, canvas, commonBackgroundSpan);
            if (sharedDeviceRenderX === null) {
              return null;
            }
            const renderX = isCommonBackground ? 0 : sharedDeviceRenderX;
            const renderY = isCommonBackground ? 0 : getSharedDeviceRenderY(element, commonBackgroundSpan);
            const renderWidth = isCommonBackground ? canvas.width : element.width;
            const renderHeight = isCommonBackground ? canvas.height : element.height;
            const renderZIndex = isCommonBackground ? -1 : element.zIndex;
            const editable = !!interactive && !!canTransform?.(element) && !isCommonBackground;

            if (editable && onElementUpdate) {
              const isSelected = selectedElementId === element.id;
              return (
                <Rnd
                  key={element.id}
                  scale={scale}
                  size={{ width: renderWidth, height: renderHeight }}
                  position={{ x: renderX, y: renderY }}
                  style={{
                    zIndex: renderZIndex,
                    opacity: element.opacity,
                    outline: isSelected ? "2px solid #f59e0b" : "none",
                    boxShadow: isSelected ? "0 0 0 2px rgba(245, 158, 11, 0.35)" : "none",
                    background: "transparent",
                  }}
                  disableDragging={false}
                  enableResizing={isSelected}
                  resizeHandleStyles={
                    isSelected
                      ? {
                          bottomRight: {
                            width: "12px",
                            height: "12px",
                            right: "-6px",
                            bottom: "-6px",
                            borderRadius: "9999px",
                            background: "#f59e0b",
                            border: "2px solid #fff",
                          },
                          bottomLeft: {
                            width: "12px",
                            height: "12px",
                            left: "-6px",
                            bottom: "-6px",
                            borderRadius: "9999px",
                            background: "#f59e0b",
                            border: "2px solid #fff",
                          },
                          topRight: {
                            width: "12px",
                            height: "12px",
                            right: "-6px",
                            top: "-6px",
                            borderRadius: "9999px",
                            background: "#f59e0b",
                            border: "2px solid #fff",
                          },
                          topLeft: {
                            width: "12px",
                            height: "12px",
                            left: "-6px",
                            top: "-6px",
                            borderRadius: "9999px",
                            background: "#f59e0b",
                            border: "2px solid #fff",
                          },
                        }
                      : undefined
                  }
                  onDragStart={(event) => {
                    event.stopPropagation();
                    onElementSelect?.(element.id);
                  }}
                  onResizeStart={(event) => {
                    event.stopPropagation();
                    onElementSelect?.(element.id);
                  }}
                  onDragStop={(_, data) => {
                    onElementUpdate(element.id, { x: data.x, y: data.y });
                  }}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    onElementUpdate(element.id, {
                      x: pos.x,
                      y: pos.y,
                      width: Number(ref.style.width.replace("px", "")),
                      height: Number(ref.style.height.replace("px", "")),
                    });
                  }}
                  onClick={(event: MouseEvent) => {
                    event.stopPropagation();
                    onElementSelect?.(element.id);
                  }}
                  >
                    <div
                      className="relative h-full w-full"
                      style={{
                      transform: `rotate(${element.rotation || 0}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    {isSelected ? (
                      <button
                        type="button"
                        aria-label="Rotate element"
                        className="absolute right-2 top-2 z-[999] h-11 w-11 cursor-grab rounded-full border-2 border-amber-700 bg-amber-100/95 text-xl font-bold leading-none text-amber-900 shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onElementSelect?.(element.id);
                          const targetRect = (
                            event.currentTarget.parentElement as HTMLDivElement | null
                          )?.getBoundingClientRect();
                          if (!targetRect) return;

                          const centerX = targetRect.left + targetRect.width / 2;
                          const centerY = targetRect.top + targetRect.height / 2;
                          const startPointerAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
                          const startRotation = element.rotation || 0;

                          const onMove = (moveEvent: PointerEvent) => {
                            const pointerAngle =
                              Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
                            const delta = normalizeAngleDelta(pointerAngle - startPointerAngle);
                            onElementUpdate?.(element.id, { rotation: Math.round((startRotation + delta) * 10) / 10 });
                          };

                          const onUp = () => {
                            window.removeEventListener("pointermove", onMove);
                            window.removeEventListener("pointerup", onUp);
                          };

                          window.addEventListener("pointermove", onMove);
                          window.addEventListener("pointerup", onUp);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="mx-auto h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 2v6h-6" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 8a9 9 0 0 0-15-3" />
                          <path d="M3 16a9 9 0 0 0 15 3" />
                        </svg>
                      </button>
                    ) : null}
                    {renderElementContent({
                      element,
                      editable: false,
                      selected: false,
                      canvasScale: 1,
                      deviceLayerTarget: "frame",
                      onUpdateData: () => {},
                      commonBackgroundSpan,
                    })}
                    {isSelected ? (
                      <div className="pointer-events-none absolute inset-0 z-[1001] border-2 border-amber-500 shadow-[0_0_0_1px_#ffffff_inset,0_0_0_3px_rgba(245,158,11,0.45)]" />
                    ) : null}
                  </div>
                </Rnd>
              );
            }

            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  zIndex: renderZIndex,
                  opacity: element.opacity,
                  left: renderX,
                  top: renderY,
                  width: renderWidth,
                  height: renderHeight,
                }}
                onClick={(event) => {
                  if (!onElementSelect) return;
                  event.stopPropagation();
                  onElementSelect(element.id);
                }}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `rotate(${element.rotation || 0}deg)`,
                    transformOrigin: "center",
                  }}
                >
                  {renderElementContent({
                    element,
                    editable: false,
                    selected: false,
                    canvasScale: 1,
                    deviceLayerTarget: "frame",
                    onUpdateData: () => {},
                    commonBackgroundSpan,
                  })}
                  {selectedElementId === element.id ? (
                    <div className="pointer-events-none absolute inset-0 z-[1001] border-2 border-amber-500 shadow-[0_0_0_1px_#ffffff_inset,0_0_0_3px_rgba(245,158,11,0.45)]" />
                  ) : null}
                </div>
              </div>
            );
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}
