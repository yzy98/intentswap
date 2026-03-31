import type { Next } from "hono";
import { getPublicClient, getWalletClient } from "../clients";
import type { AppContext } from "../lib/types";

export const publicClientMiddleware = async (c: AppContext, next: Next) => {
  const publicClient = getPublicClient(c.env.RPC_URL, c.env.CHAIN_ID);
  c.set("publicClient", publicClient);
  await next();
};

export const walletClientMiddleware = async (c: AppContext, next: Next) => {
  const walletClient = getWalletClient(
    c.env.RPC_URL,
    c.env.PRIVATE_KEY,
    c.env.CHAIN_ID
  );
  c.set("walletClient", walletClient);
  await next();
};
