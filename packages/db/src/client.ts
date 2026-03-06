/** biome-ignore-all lint/performance/noNamespaceImport: we need to import the schema as a namespace */
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const createDbClient = (databaseUrl: string) => {
  return drizzle(databaseUrl, {
    schema,
    casing: "snake_case",
  });
};
