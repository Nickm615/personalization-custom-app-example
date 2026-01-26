import "dotenv/config";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { type SyncEntities, syncRun } from "@kontent-ai/data-ops";

// Codenames of entities we want to sync
const TAXONOMY_CODENAMES = ["variant_type", "personalization_audiences"] as const;
const SNIPPET_CODENAMES = ["personalization"] as const;

const __dirname = dirname(fileURLToPath(import.meta.url));

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const main = async (): Promise<void> => {
  console.log("Starting content model sync using data-ops...\n");

  const environmentId = getEnvVar("KONTENT_ENVIRONMENT_ID");
  const apiKey = getEnvVar("KONTENT_MANAGEMENT_API_KEY");
  const folderName = path.join(__dirname, "content-model");

  console.log(`Source folder: ${folderName}`);
  console.log(`Target environment: ${environmentId}\n`);

  // Define filter functions to only sync our specific entities
  // This prevents deletion of user's existing taxonomies and snippets
  const entities: SyncEntities = {
    taxonomies: (taxonomy) =>
      TAXONOMY_CODENAMES.includes(taxonomy.codename as (typeof TAXONOMY_CODENAMES)[number]),
    contentTypeSnippets: (snippet) =>
      SNIPPET_CODENAMES.includes(snippet.codename as (typeof SNIPPET_CODENAMES)[number]),
  };

  console.log("Syncing taxonomies:");
  console.log(`  - ${TAXONOMY_CODENAMES.join(", ")}`);
  console.log("Syncing snippets:");
  console.log(`  - ${SNIPPET_CODENAMES.join(", ")}\n`);

  await syncRun({
    targetEnvironmentId: environmentId,
    targetApiKey: apiKey,
    folderName,
    entities,
  });

  console.log("\nContent model sync complete!");
  console.log("\nNext steps:");
  console.log("1. Go to your Kontent.ai environment");
  console.log("2. Open the content type you want to personalize");
  console.log("3. Add the 'Personalization' snippet to the content type");
};

await main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
