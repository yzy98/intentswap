import {
  type Chain,
  createPublicClient,
  createWalletClient,
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

const normalizeRpcUrl = (rpcUrl: string) => rpcUrl.trim();

const getPublicClientCacheKey = (rpcUrl: string, chainId: string) =>
  `${chainId}:${normalizeRpcUrl(rpcUrl)}`;

const getWalletClientCacheKey = (
  rpcUrl: string,
  chainId: string,
  accountAddress: string
) => `${chainId}:${normalizeRpcUrl(rpcUrl)}:${accountAddress.toLowerCase()}`;

const getChain = (chainId: string): Chain => {
  const chain = chains[Number(chainId)];
  if (!chain) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return chain;
};

export const getPublicClient = (rpcUrl: string, chainId: string) => {
  const cacheKey = getPublicClientCacheKey(rpcUrl, chainId);
  const cached = publicClientCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const client = createPublicClient({
    chain: getChain(chainId),
    transport: http(rpcUrl),
  });
  publicClientCache.set(cacheKey, client);
  return client;
};

export const getWalletClient = (
  rpcUrl: string,
  privateKey: string,
  chainId: string
) => {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const cacheKey = getWalletClientCacheKey(rpcUrl, chainId, account.address);
  const cached = walletClientCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const client = createWalletClient({
    chain: getChain(chainId),
    transport: http(rpcUrl),
    account,
  });
  walletClientCache.set(cacheKey, client);
  return client;
};
