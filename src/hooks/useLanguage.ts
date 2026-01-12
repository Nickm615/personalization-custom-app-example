import { useCallback, useEffect, useState } from "react";
import { fetchLanguage } from "../services/api";
import type { LoadingState } from "../types/variant.types";
import { LanguageModels } from "@kontent-ai/management-sdk";

interface UseLanguageResult {
  readonly language: LanguageModels.LanguageModel | null;
  readonly loadingState: LoadingState;
  readonly error: string | null;
}

export const useLanguage = (
  environmentId: string,
  languageId: string
): UseLanguageResult => {
  const [language, setLanguage] = useState<LanguageModels.LanguageModel | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!environmentId || !languageId) {
      return;
    }

    setLoadingState("loading");
    setError(null);

    const result = await fetchLanguage(environmentId, languageId);

    if (result.error || !result.data) {
      setError(result.error ?? "Failed to fetch language");
      setLoadingState("error");
      return;
    }

    setLanguage(result.data);
    setLoadingState("success");
  }, [environmentId, languageId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    language,
    loadingState,
    error,
  };
};
