import kontentAiConfig from "@kontent-ai/eslint-config";
import kontentAiReactConfig from "@kontent-ai/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["dist", "src/vite-env.d.ts"],
    extends: [kontentAiReactConfig],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "react/jsx-max-props-per-line": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
  {
    files: ["netlify/functions/**/*.ts"],
    extends: [kontentAiConfig],
    languageOptions: {
      parserOptions: {
        project: "./netlify/functions/tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
  {
    files: ["example-client/src/**/*.{ts,tsx}"],
    extends: [kontentAiReactConfig],
    languageOptions: {
      parserOptions: {
        project: "./example-client/tsconfig.json",
      },
    },
    rules: {
      "react/jsx-max-props-per-line": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
]);
