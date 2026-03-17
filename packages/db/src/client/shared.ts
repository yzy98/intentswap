/** biome-ignore-all lint/performance/noNamespaceImport: we need to import the schema as a namespace */

import { drizzle } from "drizzle-orm/node-postgres";
import type { Client, Pool } from "pg";
import * as schema from "../schema";

export const createDrizzleClient = (clientOrPool: Client | Pool) => {
  return drizzle(clientOrPool, {
    schema,
    casing: "snake_case",
  });
};
