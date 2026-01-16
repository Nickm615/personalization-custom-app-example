import { z } from "zod";

export const updateContentVariantsRequestSchema = z.object({
  environmentId: z.string(),
  baseItemId: z.string(),
  languageId: z.string(),
  contentVariantsElementId: z.string(),
  variantItemId: z.string(),
  operation: z.enum(["add", "remove"]),
});

export type UpdateContentVariantsRequest = z.infer<typeof updateContentVariantsRequestSchema>;
