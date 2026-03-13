import { env } from "cloudflare:workers";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { createDbClient } from "@packages/db";
import persistedOperations from "@packages/graphql-artifacts/persisted-formatted-manifests";
import { createYoga } from "graphql-yoga";
import type { Env } from "@/env";
import type { Services } from "@/services";
import { schema } from "./schema";

interface YogaContext extends Env {
  auth: Services["auth"];
}

export const yoga = createYoga<YogaContext>({
  schema,
  context: async (ctx) => {
    const session = await ctx.auth.api.getSession({
      headers: ctx.request.headers,
    });

    return {
      db: createDbClient(ctx.DATABASE_URL),
      user: session?.user ?? null,
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
      // [TODO] Better not use global env here
      allowArbitraryOperations: env.ENVIRONMENT === "development",
    }),
    useDisableIntrospection({
      isDisabled: (_req, ctx) =>
        (ctx as unknown as Env).ENVIRONMENT === "production",
    }),
  ],
});
