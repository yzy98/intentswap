import type { RefetchOptions, UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type { ReadContractReturnType } from "viem";
import { useConnection, useReadContract } from "wagmi";
import type { ReadContractErrorType } from "wagmi/actions";
import { intentFactoryContractSepolia } from "@/lib/contracts";
import type { Address } from "@/lib/types";

export type IntentIds =
  | ReadContractReturnType<
      typeof intentFactoryContractSepolia.abi,
      "getUserIntentIds",
      readonly [Address]
    >
  | undefined;

interface IntentIdsContextType {
  intentIds: IntentIds;
  isLoadingIntentIds: boolean;
  refetchIntentIds: (
    options?: RefetchOptions
  ) => Promise<UseQueryResult<ReadContractReturnType, ReadContractErrorType>>;
}

const IntentIdsContext = createContext<IntentIdsContextType | undefined>(
  undefined
);

export const IntentIdsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { address } = useConnection();

  const {
    data: intentIds,
    refetch: refetchIntentIds,
    isLoading: isLoadingIntentIds,
  } = useReadContract({
    ...intentFactoryContractSepolia,
    functionName: "getUserIntentIds",
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  return (
    <IntentIdsContext
      value={{
        intentIds,
        refetchIntentIds,
        isLoadingIntentIds,
      }}
    >
      {children}
    </IntentIdsContext>
  );
};

export const useIntentIds = () => {
  const context = useContext(IntentIdsContext);
  if (!context) {
    throw new Error("useIntentIds must be used within a IntentIdsProvider");
  }
  return context;
};
