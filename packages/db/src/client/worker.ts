/** biome-ignore-all lint/performance/noNamespaceImport: we need to import the schema as a namespace */

import { Client } from "pg";
import { createDrizzleClient } from "./shared";

export const createWorkerDbClient = async (connectionString: string) => {
  // Create a new client instance for each request
  const client = new Client({
    connectionString,
  });

  // Connect to the database
  await client.connect();

  // Create the Drizzle client with the node-postgres connection
  return createDrizzleClient(client);
};

export type WorkerDbClient = Awaited<ReturnType<typeof createWorkerDbClient>>;
