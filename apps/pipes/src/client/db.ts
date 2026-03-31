import { createNodeDbClient } from "@packages/db/node";
import type { drizzleTarget } from "@subsquid/pipes/targets/drizzle/node-postgres";
import { ENV } from "@/lib/env";

export const dbClient = createNodeDbClient(
  ENV.DATABASE_URL
) as unknown as Parameters<typeof drizzleTarget>[0]["db"];
