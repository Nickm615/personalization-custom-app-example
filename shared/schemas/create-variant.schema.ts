import { z } from "zod";

export const createVariantRequestSchema = z.object({
  environmentId: z.string(),
  sourceItemId: z.string(),
  languageId: z.string(),
  audienceTermId: z.string(),
  audienceName: z.string(),
  variantTermId: z.string(),
  variantTypeElementId: z.string(),
  audienceElementId: z.string(),
  contentVariantsElementId: z.string(),
});

export type CreateVariantRequest = z.infer<typeof createVariantRequestSchema>;

export const createVariantResponseSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
});

export type CreateVariantResponse = z.infer<typeof createVariantResponseSchema>;
