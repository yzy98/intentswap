import type { KVNamespace } from "@cloudflare/workers-types";
import type { Context } from "hono";
import type { Address, Hex, PublicClient, WalletClient } from "viem";

export type AppContext = Context<{
  Bindings: Bindings;
  Variables: Variables;
}>;

export interface Bindings {
  INTENTS_SUBSCRIPTIONS: KVNamespace;
  CORS_ORIGIN: string;
  CHAIN_ID: string;
  RPC_URL: string;
  PRIVATE_KEY: Hex;
  CONTRACT_ORACLE_ADDRESS: Address;
  CONTRACT_SWAPPER_ADDRESS: Address;
  CONTRACT_INTENT_FACTORY_ADDRESS: Address;
  CONTRACT_INTENT_EXECUTOR_ADDRESS: Address;
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
