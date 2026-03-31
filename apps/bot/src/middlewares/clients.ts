import type { MiddlewareHandler, Next } from "hono";
import { getPublicClient, getWalletClient } from "@/clients";
import type { AppContext, AppEnv } from "@/lib/types";

export const clientsMiddleware: MiddlewareHandler<AppEnv> = async (
  c: AppContext,
  next: Next
) => {
  const publicClient = getPublicClient(c.env.RPC_URL, c.env.CHAIN_ID);
  const walletClient = getWalletClient(
    c.env.RPC_URL,
    c.env.PRIVATE_KEY,
    c.env.CHAIN_ID
  );

  c.set("publicClient", publicClient);
  c.set("walletClient", walletClient);

  await next();
};
