import type { Context } from "hono";
import type { PublicClient, WalletClient } from "viem";
import type z from "zod";
import type { subscribeJsonSchema } from "@/lib/schemas";

export type AppContext = Context<AppEnv>;

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}

export interface Bindings {
  INTENTS_SUBSCRIPTIONS: KVNamespace;
  SUBSCRIPTION_RATE_LIMITER: RateLimit;
  CORS_ORIGIN: string;
  API_BASE_URL: string;
  CHAIN_ID: string;
  RPC_URL: string;
  PRIVATE_KEY: string;
}

export interface Variables {
  publicClient: PublicClient;
  walletClient: WalletClient;
  subscriptionKV: SubscriptionKV;
  walletAddress: string;
}

export interface SubscriptionKV {
  key: string;
  value: string;
}

export type SubscribeBody = z.infer<typeof subscribeJsonSchema>;
