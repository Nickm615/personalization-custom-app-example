import { z } from "zod";

export const fetchTaxonomyRequestSchema = z.object({
  environmentId: z.string(),
  codename: z.string(),
});

export type FetchTaxonomyRequest = z.infer<typeof fetchTaxonomyRequestSchema>;
