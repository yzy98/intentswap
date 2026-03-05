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
import { type Address, formatEther } from "viem";
import { Badge } from "@/components/ui/badge";
import type { IntentItemFragmentResult } from "@/hooks/user-intents-query";
import { getTokenByAddress } from "@/lib/utils";
import { BotSwitchCell } from "./bot-switch-cell";
import { ColumnHeader } from "./column-header";
import { PriceThresholdCell } from "./price-threshold-cell";
import { RowActions } from "./row-actions";

export interface IntentRow {
  intent: IntentItemFragmentResult;
  intentId: bigint;
  isActive: boolean;
  isExpired: boolean;
  botSubscribed: boolean;
}

export const columns: ColumnDef<IntentRow>[] = [
  {
    id: "tokenFrom",
    header: () => <ColumnHeader icon={CircleArrowUpIcon} title="Token from" />,
    accessorFn: (row) =>
      getTokenByAddress(row.intent.tokenFrom as Address)?.symbol,
    cell: ({ row }) => (
      <span>
        {
          getTokenByAddress((row.original.intent.tokenFrom as Address) ?? "")
            ?.symbol
        }
      </span>
    ),
  },
  {
    id: "tokenTo",
    header: () => <ColumnHeader icon={CircleArrowDownIcon} title="Token to" />,
    accessorFn: (row) =>
      getTokenByAddress(row.intent.tokenTo as Address)?.symbol,
    cell: ({ row }) => (
      <span>
        {
          getTokenByAddress((row.original.intent.tokenTo as Address) ?? "")
            ?.symbol
        }
      </span>
    ),
  },
  {
    id: "amount",
    header: () => <ColumnHeader icon={CoinsIcon} title="Amount" />,
    accessorFn: (row) => row.intent.amount,
    cell: ({ row }) => (
      <span className="block tabular-nums">
        {formatEther(BigInt(row.original.intent.amount ?? "0"))}
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
        isExpired={row.original.isExpired}
        priceThreshold={BigInt(row.original.intent.priceThreshold ?? "0")}
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
      const statusText = row.original.intent.status;
      let variant: "active" | "default" | "secondary" | "destructive";
      if (statusText === "ACTIVE") {
        variant = "default";
      } else if (statusText === "EXECUTED") {
        variant = "active";
      } else {
        variant = "secondary";
      }

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{statusText}</Badge>
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
        botSubscribed={row.original.botSubscribed}
        intentId={row.original.intentId}
        isActive={row.original.isActive}
        isExpired={row.original.isExpired}
        refetch={
          (table.options.meta as { refetchPage?: () => Promise<unknown> })
            ?.refetchPage
        }
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
          new Date(Number(row.original.intent.expiration as bigint) * 1000),
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
          botSubscribed={row.original.botSubscribed}
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
