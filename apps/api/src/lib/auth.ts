import { createAuth } from "@packages/auth/server";
import { createWorkerDbClient } from "@packages/db/worker";
import { type Chain, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { Env } from "./types";

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

export const getAuth = async (env: Env) => {
  // Create a worker db client
  const db = await createWorkerDbClient(
    env.INTENT_SWAP_API_HYPERDRIVE.connectionString
  );

  // Create a public client for verifying SIWE messages
  const publicClient = createPublicClient({
    chain: getChain(env.CHAIN_ID),
    transport: http(env.RPC_URL),
  });

  return createAuth({
    db,
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
};
