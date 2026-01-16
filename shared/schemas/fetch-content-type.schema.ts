import { z } from "zod";

export const fetchContentTypeRequestSchema = z.object({
  environmentId: z.string(),
  typeId: z.string(),
});

export type FetchContentTypeRequest = z.infer<typeof fetchContentTypeRequestSchema>;
