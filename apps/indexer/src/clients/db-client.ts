import { createDbClient } from "@packages/db";
import { ENV } from "@/env";

export const dbClient = createDbClient(ENV.DATABASE_URL);
