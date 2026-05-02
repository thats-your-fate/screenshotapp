import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["BACKGROUND", "OVERLAY", "DEVICE_FRAME", "STICKER", "ICON", "LOGO", "USER_UPLOAD", "OTHER"]),
  fileUrl: z.string().min(1),
  mimeType: z.string().min(3),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
