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
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  refetchIntent: (
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
  refetchIntent,
}: {
  children: React.ReactNode;
} & Pick<TableRowContextType, "intent" | "intentId" | "refetchIntent">) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TableRowContext
      value={{
        intent,
        intentId,
        isEditing,
        setIsEditing,
        refetchIntent,
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
