import type { Context } from "hono";
import type { getAuth } from "./auth";

export type AppContext = Context<AppEnv>;

export interface AppEnv {
  Bindings: Env;
  Variables: Vars;
}

export interface Env {
  INTENT_SWAP_API_HYPERDRIVE: Hyperdrive;
  INTENT_SWAP_API_HYPERDRIVE_CACHE_DISABLED: Hyperdrive;
  API_RATE_LIMITER: RateLimit;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
  API_BASE_URL: string;
  CHAIN_ID: string;
  RPC_URL: string;
}

export interface Vars {
  user: User | null;
  session: Session | null;
}

export type AuthInstance = Awaited<ReturnType<typeof getAuth>>;
export type User = AuthInstance["$Infer"]["Session"]["user"];
export type Session = AuthInstance["$Infer"]["Session"]["session"];
