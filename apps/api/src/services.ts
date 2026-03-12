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

  return {
    publicClient,
  };
};

export type Services = ReturnType<typeof createServices>;
