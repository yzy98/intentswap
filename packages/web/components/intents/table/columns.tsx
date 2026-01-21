"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarClockIcon,
  CircleArrowDownIcon,
  CircleArrowUpIcon,
  CircleDot,
  CoinsIcon,
  TrendingUpDownIcon,
} from "lucide-react";
import type { ReadContractReturnType } from "viem";
import { formatEther } from "viem";
import { Badge } from "@/components/ui/badge";
import type { intentFactoryContractSepolia } from "@/lib/contracts";
import type { IntentStatusNumber } from "@/lib/types";
import { getIntentStatusFromEnum, getTokenByAddress } from "@/lib/utils";
import { ColumnHeader } from "./column-header";
import { PriceThresholdCell } from "./price-threshold-cell";
import { RowActions } from "./row-actions";

export type Intent = ReadContractReturnType<
  typeof intentFactoryContractSepolia.abi,
  "getIntent",
  readonly [bigint]
>;

export interface IntentRow {
  intentId: bigint;
  intent: Intent;
  isActive: boolean;
  hasBalance: boolean;
  hasAllowance: boolean;
  canExecute: boolean;
  executionBlockReason?: string;
}

export const columns: ColumnDef<IntentRow>[] = [
  {
    id: "tokenFrom",
    header: () => <ColumnHeader icon={CircleArrowUpIcon} title="Token from" />,
    accessorFn: (row) =>
      getTokenByAddress(row.intent.tokenFrom)?.symbol ?? row.intent.tokenFrom,
    cell: ({ row }) => (
      <span>{getTokenByAddress(row.original.intent.tokenFrom)?.symbol}</span>
    ),
  },
  {
    id: "tokenTo",
    header: () => <ColumnHeader icon={CircleArrowDownIcon} title="Token to" />,
    accessorFn: (row) =>
      getTokenByAddress(row.intent.tokenTo)?.symbol ?? row.intent.tokenTo,
    cell: ({ row }) => (
      <span>{getTokenByAddress(row.original.intent.tokenTo)?.symbol}</span>
    ),
  },
  {
    id: "amount",
    header: () => <ColumnHeader icon={CoinsIcon} title="Amount" />,
    accessorFn: (row) => row.intent.amount,
    cell: ({ row }) => (
      <span className="block tabular-nums">
        {formatEther(row.original.intent.amount)}
      </span>
    ),
  },
  {
    id: "priceThreshold",
    header: () => (
      <ColumnHeader icon={TrendingUpDownIcon} title="Price threshold" />
    ),
    accessorFn: (row) => row.intent.priceThreshold,
    cell: ({ row, table }) => (
      <PriceThresholdCell
        intentId={row.original.intentId}
        isActive={row.original.isActive}
        priceThreshold={row.original.intent.priceThreshold}
        refetch={
          (table.options.meta as { refetchPage?: () => Promise<unknown> })
            ?.refetchPage
        }
      />
    ),
  },
  {
    id: "status",
    header: () => <ColumnHeader icon={CircleDot} title="Status" />,
    accessorFn: (row) => row.intent.status,
    cell: ({ row }) => {
      const statusText = getIntentStatusFromEnum(
        row.original.intent.status as IntentStatusNumber
      );
      let variant: "active" | "destructive" | "secondary";
      if (statusText === "Active") {
        variant = "active";
      } else if (statusText === "Executed") {
        variant = "destructive";
      } else {
        variant = "secondary";
      }

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{statusText}</Badge>
          {row.original.executionBlockReason && (
            <Badge variant="secondary">
              {row.original.executionBlockReason}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "expiration",
    header: () => (
      <ColumnHeader
        className="text-right"
        icon={CalendarClockIcon}
        title="Expiration"
      />
    ),
    accessorFn: (row) => row.intent.expiration,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {new Date(
          Number(row.original.intent.expiration) * 1000
        ).toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <RowActions
          canExecute={row.original.canExecute}
          intentId={row.original.intentId}
          isActive={row.original.isActive}
          refetch={
            (table.options.meta as { refetchPage?: () => Promise<unknown> })
              ?.refetchPage
          }
        />
      </div>
    ),
  },
];
