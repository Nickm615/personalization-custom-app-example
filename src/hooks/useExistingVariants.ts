import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import type { ElementModels, TaxonomyModels } from "@kontent-ai/management-sdk";
import {
  ELEMENT_SUFFIXES,
  TAXONOMY_CODENAMES,
  VARIANT_TYPE_TERMS,
  findElementIdByCodenameSuffix,
} from "../constants/codenames";
import { fetchItem, fetchTaxonomy, fetchVariant } from "../services/api";
import type { CurrentItemData, LoadingState, VariantInfo } from "../types/variant.types";
import { notNull } from "../utils/function";

interface UseExistingVariantsResult {
  readonly variants: ReadonlyArray<VariantInfo>;
  readonly loadingState: LoadingState;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

const referenceSchema = z.object({
  id: z.string(),
});

const referenceArraySchema = z.array(referenceSchema);

const findVariantTermId = (
  taxonomyTerms: ReadonlyArray<TaxonomyModels.Taxonomy>
): string | undefined => taxonomyTerms
  .map((term) => term.codename === VARIANT_TYPE_TERMS.VARIANT ? term.id : findVariantTermId(term.terms))
  .find((id) => id !== undefined);

const checkIsVariant = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  variantTermId: string
): boolean => {
  const variantTypeElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE
  );

  if (!variantTypeElementId) {
    return false;
  }

  const variantTypeElement = variantElements.find(
    (el) => el.element.id === variantTypeElementId
  );

  if (!variantTypeElement) {
    return false;
  }

  const parsed = referenceArraySchema.safeParse(variantTypeElement.value);
  if (!parsed.success) {
    return false;
  }

  return parsed.data.some((term) => term.id === variantTermId);
};

const extractLinkedItemIds = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>
): ReadonlyArray<string> => {
  const contentVariantsElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS
  );

  if (!contentVariantsElementId) {
    return [];
  }

  const contentVariantsElement = variantElements.find(
    (el) => el.element.id === contentVariantsElementId
  );

  if (!contentVariantsElement) {
    return [];
  }

  const parsed = referenceArraySchema.safeParse(contentVariantsElement.value);

  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((item) => item.id);
};

const extractAudienceTermId = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>
): string | null => {
  const audienceElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE
  );

  if (!audienceElementId) {
    return null;
  }

  const audienceElement = variantElements.find(
    (el) => el.element.id === audienceElementId
  );

  if (!audienceElement) {
    return null;
  }

  const parsed = referenceArraySchema.safeParse(audienceElement.value);

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0]?.id ?? null;
};

export const useExistingVariants = (
  environmentId: string,
  languageId: string,
  currentItemId: string,
  currentItemData: CurrentItemData | null
): UseExistingVariantsResult => {
  const [variants, setVariants] = useState<ReadonlyArray<VariantInfo>>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!environmentId || !languageId || !currentItemId || !currentItemData) {
      return;
    }

    if (!currentItemData.hasSnippet) {
      setVariants([]);
      setLoadingState("success");
      return;
    }

    setLoadingState("loading");
    setError(null);

    const linkedItemIds = extractLinkedItemIds(
      currentItemData.variant.elements,
      currentItemData.elementCodenames
    );

    if (linkedItemIds.length === 0) {
      setVariants([]);
      setLoadingState("success");
      return;
    }

    // Fetch variant_type taxonomy to determine which items are base content vs variants
    const taxonomyResult = await fetchTaxonomy(
      environmentId,
      TAXONOMY_CODENAMES.VARIANT_TYPE
    );

    const variantTermId = taxonomyResult.data
      ? findVariantTermId(taxonomyResult.data.terms)
      : undefined;
      
    if (!variantTermId) {
      setError("Variant type taxonomy not found");
      setLoadingState("error");
      return;
    }

    const variantPromises = linkedItemIds
      .map(async (itemId) => {
        const [itemResult, variantResult] = await Promise.all([
          fetchItem(environmentId, itemId),
          fetchVariant(environmentId, itemId, languageId),
        ]);

        if (itemResult.error || !itemResult.data) {
          return null;
        }

        if (variantResult.error || !variantResult.data) {
          return null;
        }

        const audienceTermId = extractAudienceTermId(
          variantResult.data.elements,
          currentItemData.elementCodenames
        );

        const isVariant = checkIsVariant(
          variantResult.data.elements,
          currentItemData.elementCodenames,
          variantTermId
        );

        return {
          id: itemId,
          name: itemResult.data.name,
          audienceTermId,
          isBaseContent: !isVariant,
        } satisfies VariantInfo;
      });

    const results = await Promise.all(variantPromises);
    const validVariants = results.filter(notNull);

    // Sort: base content first, then variants
    const sortedVariants = [...validVariants].sort((a, b) => {
      if (a.isBaseContent && !b.isBaseContent) return -1;
      if (!a.isBaseContent && b.isBaseContent) return 1;
      return 0;
    });

    setVariants(sortedVariants);
    setLoadingState("success");
  }, [environmentId, languageId, currentItemId, currentItemData]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    variants,
    loadingState,
    error,
    refetch: fetchData,
  };
};
