import { DeliveryClient } from "@kontent-ai/delivery-sdk";

const environmentId = import.meta.env.VITE_KONTENT_ENVIRONMENT_ID;
const previewApiKey = import.meta.env.VITE_KONTENT_PREVIEW_API_KEY;

const missingVars: ReadonlyArray<string> = [
  !environmentId && "VITE_KONTENT_ENVIRONMENT_ID",
  !previewApiKey && "VITE_KONTENT_PREVIEW_API_KEY",
].filter((v): v is string => v !== false);

if (missingVars.length > 0) {
  throw new Error(
    `Missing environment variables: ${missingVars.join(", ")}. ` +
      "Please copy .env.template to .env and configure the values.",
  );
}

export const deliveryClient = new DeliveryClient({
  environmentId,
  previewApiKey,
  defaultQueryConfig: {
    usePreviewMode: true,
  },
});
