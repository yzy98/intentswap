import {
  type Chain,
  createPublicClient,
  createWalletClient,
  type Hex,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const chains: Record<number, Chain> = {
  [sepolia.id]: sepolia,
};

const publicClientCache = new Map<string, PublicClient>();
const walletClientCache = new Map<string, WalletClient>();

const getChain = (chainId: string): Chain => {
  const chain = chains[Number(chainId)];
  if (!chain) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return chain;
};

export const getPublicClient = (rpcUrl: string, chainId: string) => {
  const cached = publicClientCache.get(rpcUrl);
  if (cached) {
    return cached;
  }
  const client = createPublicClient({
    chain: getChain(chainId),
    transport: http(rpcUrl),
  });
  publicClientCache.set(rpcUrl, client);
  return client;
};

export const getWalletClient = (
  rpcUrl: string,
  privateKey: Hex,
  chainId: string
) => {
  const cached = walletClientCache.get(`${rpcUrl}:${privateKey.toLowerCase()}`);
  if (cached) {
    return cached;
  }
  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    chain: getChain(chainId),
    transport: http(rpcUrl),
    account,
  });
  walletClientCache.set(`${rpcUrl}:${privateKey.toLowerCase()}`, client);
  return client;
};
