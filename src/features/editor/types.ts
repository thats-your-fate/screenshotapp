import type { ElementKind } from "@prisma/client";
import type { FontOptionId } from "@/features/editor/fonts";

export type ElementData = {
  text?: string;
  fontSize?: number;
  fontWeight?: number | "normal" | "bold";
  fontStyle?: "normal" | "italic";
  fontFamily?: FontOptionId;
  color?: string;
  align?: "left" | "center" | "right";
  assetUrl?: string | null;
  fit?: "cover" | "contain";
  borderRadius?: number;
  placeholderLabel?: string;
  deviceType?: "iphone";
  deviceBackgroundColor?: string;
  deviceMaskFillAssetUrl?: string | null;
  deviceScreenOffsetX?: number;
  deviceScreenOffsetY?: number;
  deviceScreenScale?: number;
  deviceMaskOffsetX?: number;
  deviceMaskOffsetY?: number;
  deviceMaskScale?: number;
  commonBackground?: boolean;
  sharedDevicePairId?: string;
  sharedDeviceStartIndex?: number;
  sharedDeviceSpanWidth?: number;
  sharedDeviceOffsetY?: number;
};

export type EditorElement = {
  id: string;
  source?: "template" | "custom";
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
  data: ElementData;
};

export type EditorCanvas = {
  width: number;
  height: number;
  backgroundColor: string;
};

export type EditorScreen = {
  id: string;
  name: string;
  canvas: EditorCanvas;
  elements: EditorElement[];
};
