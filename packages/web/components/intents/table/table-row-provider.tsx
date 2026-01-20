import type { RefetchOptions, UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReadContractReturnType } from "viem";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import type { ReadContractErrorType } from "wagmi/actions";
import {
  intentExecutorContractSepolia,
  type intentFactoryContractSepolia,
} from "@/lib/contracts";

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
  isActive: boolean;
  hasBalance: boolean;
  hasAllowance: boolean;
  canExecute: boolean;
  executionBlockReason?: string;
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

  const isActive = intent.status === 0;

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: intent.tokenFrom,
    functionName: "balanceOf",
    args: [intent.user],
  });

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    address: intent.tokenFrom,
    functionName: "allowance",
    args: [intent.user, intentExecutorContractSepolia.address],
  });

  const hasBalance = balance !== undefined && balance >= intent.amount;
  const hasAllowance = allowance !== undefined && allowance >= intent.amount;

  const executionBlockReason = useMemo(() => {
    if (!isActive) {
      return undefined;
    }
    if (!hasBalance) {
      return "Insufficient balance";
    }
    if (!hasAllowance) {
      return "Not approved";
    }
    return undefined;
  }, [isActive, hasAllowance, hasBalance]);

  const canExecute = isActive && hasBalance && hasAllowance;

  return (
    <TableRowContext
      value={{
        intent,
        intentId,
        isEditing,
        setIsEditing,
        isActive,
        hasBalance,
        hasAllowance,
        canExecute,
        executionBlockReason,
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
