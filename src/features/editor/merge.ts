import type { EditorElement } from "@/features/editor/types";

export type OverrideMap = Record<string, Partial<EditorElement> & { data?: Record<string, unknown> }>;

export function mergeElementsWithOverrides(elements: EditorElement[], overrides: OverrideMap = {}) {
  return elements.map((element) => {
    const override = overrides[element.id];
    if (!override) {
      return element;
    }

    return {
      ...element,
      ...override,
      data: {
        ...element.data,
        ...(override.data || {}),
      },
    } as EditorElement;
  });
}
