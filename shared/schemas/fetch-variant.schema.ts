import { z } from "zod";

export const fetchVariantRequestSchema = z.object({
  environmentId: z.string(),
  itemId: z.string(),
  languageId: z.string(),
});

export type FetchVariantRequest = z.infer<typeof fetchVariantRequestSchema>;
