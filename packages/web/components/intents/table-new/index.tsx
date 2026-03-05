import { useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { readFragment } from "gql.tada";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { useBlock, useChainId } from "wagmi";
import { useIntentsCountQuery } from "@/hooks/use-intents-count-query";
import { useIntentsQuery } from "@/hooks/user-intents-query";
import { fetchBotStatusBatch } from "@/lib/api/bot";
import { IntentItem_Fragment } from "@/lib/api/gql";
import { DataTable } from "../table/data-table";
import { columns } from "./columns";

interface IntentsTableProps {
  user: Address;
}

export const IntentsTable = ({ user }: IntentsTableProps) => {
  const chainId = useChainId();
  const { data: block } = useBlock();
  const chainBlockTimestamp = block?.timestamp;

  // Table pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Intents count
  const {
    data: intentsCount,
    fetching: isFetchingIntentsCount,
    reExecuteQuery: refetchIntentsCount,
  } = useIntentsCountQuery({
    user,
  });

  // Intents, with pagination
  const {
    data: intents,
    fetching: isFetchingIntents,
    reExecuteQuery: refetchIntents,
  } = useIntentsQuery({
    user,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const currentPageIntentIds =
    intents?.userIntents?.map((intent) => intent.id as bigint) ?? [];

  // Bot statuses
  const { data: botStatuses, refetch: refetchBotStatuses } = useQuery({
    queryKey: ["bot-status-batch", currentPageIntentIds.join(","), chainId],
    queryFn: () => fetchBotStatusBatch(currentPageIntentIds, chainId),
    enabled: !!currentPageIntentIds.length,
  });

  const currentPageData = useMemo(() => {
    if (!intents?.userIntents) {
      return [];
    }
    return intents.userIntents.map((intent) => {
      const botSubscribed = intent.id
        ? (botStatuses?.statuses?.[intent.id.toString()] ?? false)
        : false;
      const intentItemData = readFragment(IntentItem_Fragment, intent);
      const isActive = intentItemData.status === "ACTIVE";
      const isExpired =
        isActive &&
        chainBlockTimestamp !== undefined &&
        intentItemData.expiration !== null &&
        intentItemData.expiration <= chainBlockTimestamp;

      return {
        intent: intentItemData,
        intentId: intent.id ?? BigInt(0),
        isActive,
        isExpired,
        botSubscribed,
      };
    });
  }, [intents?.userIntents, botStatuses, chainBlockTimestamp]);

  const refetchPage = () =>
    Promise.all([
      refetchIntentsCount(),
      refetchIntents(),
      refetchBotStatuses(),
    ]);

  return (
    <DataTable
      columns={columns}
      data={currentPageData}
      isLoading={isFetchingIntents || isFetchingIntentsCount}
      pagination={pagination}
      refetchPage={refetchPage}
      rowCount={intentsCount?.total ?? 0}
      setPagination={setPagination}
    />
  );
};
