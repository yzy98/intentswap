import { env } from "cloudflare:workers";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { createDbClient } from "@packages/db";
import persistedOperations from "@packages/graphql-artifacts/persisted-formatted-manifests";
import { createYoga } from "graphql-yoga";
import { jwtVerify } from "jose";
import type { Address } from "viem";
import type { Env } from "@/env";
import { schema } from "./schema";

export const yoga = createYoga<Env>({
  schema,
  context: async (ctx) => {
    let user: Address | null = null;

    // Extract JWT from Authorization header
    const authHeader = ctx.request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const secret = new TextEncoder().encode(ctx.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        user = (payload.address as Address) ?? null;
      } catch {
        user = null;
      }
    }

    return {
      db: createDbClient(ctx.DATABASE_URL),
      user,
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
