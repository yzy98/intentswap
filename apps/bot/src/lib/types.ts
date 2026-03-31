import type { Context } from "hono";
import type { Address, PublicClient, WalletClient } from "viem";

export type AppContext = Context<AppEnv>;

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}

export interface Bindings {
  INTENTS_SUBSCRIPTIONS: KVNamespace;
  SUBSCRIPTION_RATE_LIMITER: RateLimit;
  CORS_ORIGIN: string;
  CHAIN_ID: string;
  RPC_URL: string;
  PRIVATE_KEY: string;
}

export interface Variables {
  publicClient: PublicClient;
  walletClient: WalletClient;
  subscriptionKV: SubscriptionKV;
}

export interface SubscribeBody {
  intentId: string;
  chainId: number;
  user: Address;
}

export interface SubscriptionKV {
  key: string;
  value: string;
}
