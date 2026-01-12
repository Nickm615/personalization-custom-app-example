import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import type { ContentTypeElements, ElementModels, LanguageVariantModels, TaxonomyModels } from "@kontent-ai/management-sdk";
import {
  ELEMENT_SUFFIXES,
  TAXONOMY_CODENAMES,
  VARIANT_TYPE_TERMS,
  findElementIdByCodenameSuffix,
} from "../constants/codenames";
import { fetchContentType, fetchItem, fetchTaxonomy, fetchVariant } from "../services/api";
import type {
  CurrentItemData,
  LoadingState,
  UseCurrentItemResult,
} from "../types/variant.types";

const buildElementCodenamesMap = (
  contentTypeElements: ReadonlyArray<ContentTypeElements.Element>,
  snippetElements: ReadonlyArray<ReadonlyArray<ContentTypeElements.Element>>
): ReadonlyMap<string, string> => {
  const entries: Array<[string, string]> = [];

  contentTypeElements.forEach((element) => {
    if (element.id && element.codename) {
      entries.push([element.id, element.codename]);
    }
  });

  snippetElements.flat().forEach((element) => {
    if (element.id && element.codename) {
      entries.push([element.id, element.codename]);
    }
  });

  return new Map(entries);
};

const findVariantTermId = (taxonomy: TaxonomyModels.Taxonomy): string | undefined => {
  // Terms are also of type Taxonomy (nested structure)
  const findInTerms = (terms: ReadonlyArray<TaxonomyModels.Taxonomy>): string | undefined => {
    for (const term of terms) {
      if (term.codename === VARIANT_TYPE_TERMS.VARIANT) {
        return term.id;
      }
      if (term.terms.length > 0) {
        const found = findInTerms(term.terms);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findInTerms(taxonomy.terms);
};

const referenceObjectSchema = z.object({
  id: z.string(),
});

const referenceArraySchema = z.array(referenceObjectSchema);

const checkIfVariant = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  variantTermId: string | undefined
): boolean => {
  if (!variantTermId) {
    return false;
  }

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

  const taxonomyValue = referenceArraySchema.safeParse(variantTypeElement.value);
  if (!taxonomyValue.success) {
    return false;
  }

  return taxonomyValue.data.some((term) => term.id === variantTermId);
};

const checkHasSnippet = (
  elementCodenames: ReadonlyMap<string, string>
): boolean => {
  const variantTypeId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE
  );
  const audienceId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE
  );
  const contentVariantsId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS
  );

  return Boolean(variantTypeId && audienceId && contentVariantsId);
};

export const useCurrentItem = (
  environmentId: string,
  itemId: string,
  languageId: string
): UseCurrentItemResult => {
  const [data, setData] = useState<CurrentItemData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!environmentId || !itemId || !languageId) {
      return;
    }

    setLoadingState("loading");
    setError(null);

    const [itemResult, variantResult] = await Promise.all([
      fetchItem(environmentId, itemId),
      fetchVariant(environmentId, itemId, languageId),
    ]);

    if (itemResult.error || !itemResult.data) {
      setError(itemResult.error ?? "Failed to fetch item");
      setLoadingState("error");
      return;
    }

    if (variantResult.error || !variantResult.data) {
      setError(variantResult.error ?? "Failed to fetch variant");
      setLoadingState("error");
      return;
    }

    const typeResult = await fetchContentType(
      environmentId,
      itemResult.data.type.id
    );

    if (typeResult.error || !typeResult.data) {
      setError(typeResult.error ?? "Failed to fetch content type");
      setLoadingState("error");
      return;
    }

    const elementCodenames = buildElementCodenamesMap(
      typeResult.data.contentType.elements,
      typeResult.data.snippets.map((s) => s.elements)
    );

    const hasSnippet = checkHasSnippet(elementCodenames);

    const isVariant = hasSnippet && await determineIsVariant(variantResult.data, elementCodenames, environmentId);

    setData({
      item: itemResult.data,
      variant: variantResult.data,
      contentType: typeResult.data.contentType,
      snippets: typeResult.data.snippets,
      elementCodenames,
      isVariant,
      hasSnippet,
    });
    setLoadingState("success");
  }, [environmentId, itemId, languageId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loadingState,
    error,
    refetch: fetchData,
  };
};

const determineIsVariant = async (
  variant: LanguageVariantModels.ContentItemLanguageVariant,
  elementCodenames: ReadonlyMap<string, string>,
  environmentId: string
): Promise<boolean> => {
  const taxonomyResult = await fetchTaxonomy(
    environmentId,
    TAXONOMY_CODENAMES.VARIANT_TYPE
  );

  if (taxonomyResult.data) {
    const variantTermId = findVariantTermId(taxonomyResult.data);
    return checkIfVariant(variant.elements, elementCodenames, variantTermId);
  }
  return false;
};