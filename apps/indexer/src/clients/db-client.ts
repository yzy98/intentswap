import { createDbClient } from "@packages/db";
import { ENV } from "@/env";

export const db = createDbClient(ENV.DATABASE_URL);
