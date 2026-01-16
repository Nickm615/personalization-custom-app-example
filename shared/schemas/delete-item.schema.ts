import { z } from "zod";

export const deleteItemRequestSchema = z.object({
  environmentId: z.string(),
  itemId: z.string(),
  languageId: z.string(),
});

export type DeleteItemRequest = z.infer<typeof deleteItemRequestSchema>;
