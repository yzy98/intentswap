import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { createDbClient } from "@packages/db";
import persistedOperations from "@packages/graphql-artifacts/persisted-formatted-manifests";
import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";

export interface Env {
  DATABASE_URL: string;
  CORS_ORIGIN: string;
}

const yoga = createYoga<Env>({
  schema,
  cors: (_request, env) => ({
    origin: (env as Env).CORS_ORIGIN,
    methods: ["GET", "POST"],
  }),
  context: (ctx) => {
    return {
      db: createDbClient(ctx.DATABASE_URL),
    };
  },
  plugins: [
    usePersistedOperations({
      getPersistedOperation(key: string) {
        return (persistedOperations as Record<string, string>)[key] ?? null;
      },
    }),
  ],
});

export default {
  fetch: yoga.fetch,
} satisfies ExportedHandler<Env>;
