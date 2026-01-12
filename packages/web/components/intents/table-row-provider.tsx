import type { RefetchOptions, UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import type { ReadContractReturnType } from "viem";
import type { ReadContractErrorType } from "wagmi/actions";
import type { intentFactoryContractSepolia } from "@/lib/contracts";

export type Intent = ReadContractReturnType<
  typeof intentFactoryContractSepolia.abi,
  "getIntent",
  readonly [bigint]
>;

interface TableRowContextType {
  intent: Intent;
  intentId: bigint;
  isPoolKeySet: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  refetchIntent: (
    options?: RefetchOptions
  ) => Promise<UseQueryResult<ReadContractReturnType, ReadContractErrorType>>;
  refetchPoolKey: (
    options?: RefetchOptions
  ) => Promise<UseQueryResult<ReadContractReturnType, ReadContractErrorType>>;
}

const TableRowContext = createContext<TableRowContextType | undefined>(
  undefined
);

export const TableRowProvider = ({
  children,
  intent,
  intentId,
  isPoolKeySet,
  refetchIntent,
  refetchPoolKey,
}: {
  children: React.ReactNode;
} & Pick<
  TableRowContextType,
  "intent" | "intentId" | "isPoolKeySet" | "refetchIntent" | "refetchPoolKey"
>) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TableRowContext
      value={{
        intent,
        intentId,
        isPoolKeySet,
        isEditing,
        setIsEditing,
        refetchIntent,
        refetchPoolKey,
      }}
    >
      {children}
    </TableRowContext>
  );
};

export const useTableRow = () => {
  const context = useContext(TableRowContext);
  if (!context) {
    throw new Error("useTableRow must be used within a TableRowProvider");
  }
  return context;
};
