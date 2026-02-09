import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { oracleContract } from "@/lib/constants";

/**
 * Hook to check if a price feed exists for a token pair
 */
export function useHasFeed(tokenFrom?: Address, tokenTo?: Address) {
  return useReadContract({
    ...oracleContract,
    functionName: "hasFeed",
    args: tokenFrom && tokenTo ? [tokenFrom, tokenTo] : undefined,
    query: {
      enabled: !!(tokenFrom && tokenTo && tokenFrom !== tokenTo),
    },
  });
}
