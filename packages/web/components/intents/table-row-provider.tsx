import { createContext, useContext, useState } from "react";
import type { ReadContractReturnType } from "viem";
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
}

const TableRowContext = createContext<TableRowContextType | undefined>(
  undefined
);

export const TableRowProvider = ({
  children,
  intent,
  intentId,
  isPoolKeySet,
}: {
  children: React.ReactNode;
  intent: Intent;
  intentId: bigint;
  isPoolKeySet: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TableRowContext
      value={{ intent, intentId, isPoolKeySet, isEditing, setIsEditing }}
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
