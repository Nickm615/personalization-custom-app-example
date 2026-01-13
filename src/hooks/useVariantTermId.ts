import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { TaxonomyModels } from "@kontent-ai/management-sdk";
import { TAXONOMY_CODENAMES, VARIANT_TYPE_TERMS } from "../constants/codenames";
import { queryKeys } from "../constants/queryKeys";
import { fetchTaxonomy } from "../services/api";

const findVariantTermId = (
  terms: ReadonlyArray<TaxonomyModels.Taxonomy>
): string | undefined =>
  terms
    .map((term) =>
      term.codename === VARIANT_TYPE_TERMS.VARIANT
        ? term.id
        : findVariantTermId(term.terms)
    )
    .find((id) => id !== undefined);

export const useVariantTermId = (environmentId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.taxonomy(environmentId, TAXONOMY_CODENAMES.VARIANT_TYPE),
    queryFn: async () => {
      const result = await fetchTaxonomy(
        environmentId,
        TAXONOMY_CODENAMES.VARIANT_TYPE
      );
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to fetch variant type taxonomy");
      }
      return result.data;
    },
  });

  const variantTermId = useMemo(() => findVariantTermId(data.terms), [data.terms]);

  if (!variantTermId) {
    throw new Error("Variant term not found in taxonomy");
  }

  return { variantTermId };
};
