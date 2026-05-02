import { z } from "zod";
import { templateElementSchema } from "@/features/templates/validations";

export const createProjectFromTemplateSchema = z.object({
  templateId: z.string().cuid(),
  name: z.string().trim().min(2).max(120).optional(),
});

export const updateProjectNameSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().trim().min(2).max(120),
});

export const saveOverrideSchema = z.object({
  projectId: z.string().cuid(),
  templateElementId: z.string().cuid(),
  overriddenProps: z.record(z.string(), z.unknown()),
});

export const saveProjectEditorStateSchema = z.object({
  projectId: z.string().cuid(),
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
        elements: z.array(
          templateElementSchema.extend({
            source: z.enum(["template", "custom"]).optional(),
          }),
        ),
      }),
    )
    .min(1),
});
