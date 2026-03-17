import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { createWorkerDbClient } from "@packages/db/worker";
import persistedOperations from "@packages/graphql-artifacts/persisted-formatted-manifests";
import { createYoga } from "graphql-yoga";
import type { Env, Session, User } from "@/lib/types";
import { schema } from "./schema";

interface YogaContext extends Env {
  user: User | null;
  session: Session | null;
}

const createYogaApp = (env: Env) =>
  createYoga<YogaContext>({
    schema,
    context: async (ctx) => {
      const db = await createWorkerDbClient(
        ctx.INTENT_SWAP_API_HYPERDRIVE.connectionString
      );
      const { user } = ctx;

      return {
        db,
        user,
      };
    },
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
    graphiql: (_req, ctx) => ctx.ENVIRONMENT === "development",
    plugins: [
      usePersistedOperations({
        getPersistedOperation(key: string) {
          return (persistedOperations as Record<string, string>)[key] ?? null;
        },
        allowArbitraryOperations: env.ENVIRONMENT === "development",
      }),
      useDisableIntrospection({
        isDisabled: () => env.ENVIRONMENT === "production",
      }),
    ],
  });

const yogaMap = new Map<string, ReturnType<typeof createYogaApp>>();

export const getYogaApp = (env: Env) => {
  const key = `${env.ENVIRONMENT}:${env.CORS_ORIGIN}`;

  let yoga = yogaMap.get(key);
  if (!yoga) {
    yoga = createYogaApp(env);
    yogaMap.set(key, yoga);
  }

  return yoga;
};
