import { createAuth } from "@packages/auth/server";
import { createDbClient } from "@packages/db";
import { type Chain, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { Env } from "./env";

const chains: Record<number, Chain> = {
  [baseSepolia.id]: baseSepolia,
  [base.id]: base,
};

const getChain = (chainId: string): Chain => {
  const chain = chains[Number(chainId)];
  if (!chain) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return chain;
};

export const createServices = (env: Env) => {
  const publicClient = createPublicClient({
    chain: getChain(env.CHAIN_ID),
    transport: http(env.RPC_URL),
  });

  const auth = createAuth({
    db: createDbClient(env.DATABASE_URL),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.API_BASE_URL,
    trustedOrigins: [env.CORS_ORIGIN],
    domain: new URL(env.CORS_ORIGIN).host,
    verifyMessage: async ({ address, message, signature }) => {
      return await publicClient.verifySiweMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    },
  });

  return {
    publicClient,
    auth,
  };
};

export type Services = ReturnType<typeof createServices>;
