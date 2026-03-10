import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { createDbClient } from "@packages/db";
import persistedOperations from "@packages/graphql-artifacts/persisted-formatted-manifests";
import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";

export interface Env {
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: "development" | "production";
}

const yoga = createYoga<Env>({
  schema,
  context: (ctx) => {
    return {
      db: createDbClient(ctx.DATABASE_URL),
    };
  },
  cors: (_req, ctx) => ({
    origin: (ctx as Env).CORS_ORIGIN,
    methods: ["GET", "POST"],
  }),
  graphiql: (_req, ctx) => ctx.ENVIRONMENT === "development",
  plugins: [
    usePersistedOperations({
      getPersistedOperation(key: string) {
        return (persistedOperations as Record<string, string>)[key] ?? null;
      },
    }),
    useDisableIntrospection({
      isDisabled: (_req, ctx) =>
        (ctx as unknown as Env).ENVIRONMENT === "production",
    }),
  ],
});

export default {
  fetch: yoga.fetch,
} satisfies ExportedHandler<Env>;
