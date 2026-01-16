import { z } from "zod";

export const fetchLanguageRequestSchema = z.object({
  environmentId: z.string(),
  languageId: z.string(),
});

export type FetchLanguageRequest = z.infer<typeof fetchLanguageRequestSchema>;
