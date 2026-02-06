import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { oracleContractSepolia } from "@/lib/constants";

/**
 * Hook to get the safe price for a token pair from the Oracle contract
 * Returns [price, decimals, updatedAt]
 */
export function useSafePrice(tokenFrom?: Address, tokenTo?: Address) {
  return useReadContract({
    ...oracleContractSepolia,
    functionName: "getSafePrice",
    args: tokenFrom && tokenTo ? [tokenFrom, tokenTo] : undefined,
    query: {
      enabled: !!(tokenFrom && tokenTo && tokenFrom !== tokenTo),
    },
  });
}
