import { createDbClient } from "@packages/db";
import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import type { Env } from "./env";

const yoga = createYoga<Env>({
  schema,
  context: (ctx) => {
    return {
      db: createDbClient(ctx.DATABASE_URL),
    };
  },
});

export default {
  fetch: yoga.fetch,
} satisfies ExportedHandler<Env>;
