import { z } from "zod";

export const templateStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createTemplateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase kebab-case"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  canvasWidth: z.coerce.number().int().min(100).max(4000),
  canvasHeight: z.coerce.number().int().min(100).max(4000),
  backgroundColor: z.string().default("#ffffff"),
});

export const templateElementSchema = z.object({
  id: z.string(),
  kind: z.enum(["TEXT", "IMAGE", "SHAPE", "DEVICE_SCREENSHOT_SLOT", "GROUP"]),
  name: z.string(),
  zIndex: z.number().int(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
  visible: z.boolean(),
  editableByUser: z.boolean(),
  data: z.record(z.string(), z.unknown()),
});

export const saveTemplateElementsSchema = z.object({
  templateId: z.string().cuid(),
  backgroundColor: z.string().optional(),
  elements: z.array(templateElementSchema).optional(),
  screens: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(120),
        canvas: z.object({
          width: z.number().int().min(200).max(5000),
          height: z.number().int().min(200).max(5000),
          backgroundColor: z.string().min(1),
        }),
        elements: z.array(templateElementSchema),
      }),
    )
    .min(1)
    .optional(),
}).refine((value) => (value.screens?.length ?? 0) > 0 || (value.elements?.length ?? 0) > 0, {
  message: "At least one screen or element is required.",
});
