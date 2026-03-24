import { createNodeDbClient } from "@packages/db/node";
import { ENV } from "@/env";

export const db = createNodeDbClient(ENV.DATABASE_URL);
