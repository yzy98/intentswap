"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  BotIcon,
  CalendarClockIcon,
  CircleArrowDownIcon,
  CircleArrowUpIcon,
  CircleDot,
  CoinsIcon,
  TrendingUpDownIcon,
} from "lucide-react";
import { formatEther } from "viem";
import { Badge } from "@/components/ui/badge";
import type { IntentRow, IntentStatusNumber } from "@/lib/types";
import { getIntentStatusFromEnum, getTokenByAddress } from "@/lib/utils";
import { BotSwitchCell } from "./bot-switch-cell";
import { ColumnHeader } from "./column-header";
import { PriceThresholdCell } from "./price-threshold-cell";
import { RowActions } from "./row-actions";

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
        refetch={
          (table.options.meta as { refetchPage?: () => Promise<unknown> })
            ?.refetchPage
        }
        row={row}
      />
    ),
  },
  {
    id: "status",
    header: () => <ColumnHeader icon={CircleDot} title="Status" />,
    accessorFn: (row) => row.intent.status,
    cell: ({ row }) => {
      const statusText = row.original.isExpired
        ? "Expired"
        : getIntentStatusFromEnum(
            row.original.intent.status as IntentStatusNumber
          );
      let variant: "active" | "default" | "secondary" | "destructive";
      if (statusText === "Expired") {
        variant = "destructive";
      } else if (statusText === "Active") {
        variant = "default";
      } else if (statusText === "Executed") {
        variant = "active";
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
    id: "bot",
    header: () => <ColumnHeader icon={BotIcon} title="Bot Auto-Exec" />,
    accessorFn: (row) => row.botSubscribed,
    cell: ({ row, table }) => (
      <BotSwitchCell
        refetch={
          (table.options.meta as { refetchPage?: () => Promise<unknown> })
            ?.refetchPage
        }
        row={row}
      />
    ),
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
        {format(
          new Date(Number(row.original.intent.expiration) * 1000),
          "PPpp"
        )}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <RowActions
          refetch={
            (table.options.meta as { refetchPage?: () => Promise<unknown> })
              ?.refetchPage
          }
          row={row}
        />
      </div>
    ),
  },
];
