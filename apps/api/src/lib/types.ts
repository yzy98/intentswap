import type { Context } from "hono";
import type { getAuth } from "./auth";

export type AppContext = Context<AppEnv>;

export interface AppEnv {
  Bindings: Env;
  Variables: Vars;
}

export interface Env {
  API_RATE_LIMITER: RateLimit;
  DATABASE_URL: string;
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

export type AuthInstance = ReturnType<typeof getAuth>;
export type User = AuthInstance["$Infer"]["Session"]["user"];
export type Session = AuthInstance["$Infer"]["Session"]["session"];
