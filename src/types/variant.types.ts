import type {
  ContentItemModels,
  ContentTypeModels,
  ContentTypeSnippetModels,
  LanguageVariantModels,
} from "@kontent-ai/management-sdk";

export interface CurrentItemData {
  readonly item: ContentItemModels.ContentItem;
  readonly variant: LanguageVariantModels.ContentItemLanguageVariant;
  readonly contentType: ContentTypeModels.ContentType;
  readonly snippets: ReadonlyArray<ContentTypeSnippetModels.ContentTypeSnippet>;
  readonly elementCodenames: ReadonlyMap<string, string>;
  readonly isVariant: boolean;
  readonly hasSnippet: boolean;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface UseCurrentItemResult {
  readonly data: CurrentItemData | null;
  readonly loadingState: LoadingState;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}
