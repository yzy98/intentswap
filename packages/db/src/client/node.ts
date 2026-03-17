/** biome-ignore-all lint/performance/noNamespaceImport: we need to import the schema as a namespace */

import { Pool } from "pg";
import { createDrizzleClient } from "./shared";

export const createNodeDbClient = (connectionString: string) => {
  // Create a new pool
  const pool = new Pool({
    connectionString,
  });

  // Create the Drizzle client with the pool
  return createDrizzleClient(pool);
};

export type NodeDbClient = ReturnType<typeof createNodeDbClient>;
