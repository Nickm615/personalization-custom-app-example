import { z } from "zod";

export const fetchItemRequestSchema = z.object({
  environmentId: z.string(),
  itemId: z.string(),
});

export type FetchItemRequest = z.infer<typeof fetchItemRequestSchema>;
