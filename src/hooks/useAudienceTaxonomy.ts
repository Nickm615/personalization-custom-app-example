import { useCallback, useEffect, useState } from "react";
import type { TaxonomyModels } from "@kontent-ai/management-sdk";
import { TAXONOMY_CODENAMES } from "../constants/codenames";
import { fetchTaxonomy } from "../services/api";
import type { LoadingState } from "../types/variant.types";

interface AudienceTerm {
  readonly id: string;
  readonly name: string;
  readonly codename: string;
}

interface UseAudienceTaxonomyResult {
  readonly terms: ReadonlyArray<AudienceTerm>;
  readonly termMap: ReadonlyMap<string, string>;
  readonly loadingState: LoadingState;
  readonly error: string | null;
}

const flattenTerms = (
  terms: ReadonlyArray<TaxonomyModels.Taxonomy>
): ReadonlyArray<AudienceTerm> =>
  terms.flatMap((term) => [
    { id: term.id, name: term.name, codename: term.codename },
    ...flattenTerms(term.terms),
  ]);

export const useAudienceTaxonomy = (
  environmentId: string
): UseAudienceTaxonomyResult => {
  const [terms, setTerms] = useState<ReadonlyArray<AudienceTerm>>([]);
  const [termMap, setTermMap] = useState<ReadonlyMap<string, string>>(new Map());
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!environmentId) {
      return;
    }

    setLoadingState("loading");
    setError(null);

    const result = await fetchTaxonomy(
      environmentId,
      TAXONOMY_CODENAMES.PERSONALIZATION_AUDIENCES
    );

    if (result.error || !result.data) {
      setError(result.error ?? "Failed to fetch audience taxonomy");
      setLoadingState("error");
      return;
    }

    const flatTerms = flattenTerms(result.data.terms);
    const map = new Map(flatTerms.map((t) => [t.id, t.name]));

    setTerms(flatTerms);
    setTermMap(map);
    setLoadingState("success");
  }, [environmentId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    terms,
    termMap,
    loadingState,
    error,
  };
};
