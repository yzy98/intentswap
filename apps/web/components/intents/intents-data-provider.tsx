"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { readFragment } from "gql.tada";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { useClient } from "urql";
import type { Address } from "viem";
import { useBlock, useChainId } from "wagmi";
import { useIntentsCount } from "@/components/dashboard/intents-count-provider";
import { useIntentsQuery } from "@/hooks/user-intents-query";
import { fetchBotStatusBatch } from "@/lib/api/bot";
import {
  IntentItem_Fragment,
  type IntentItemFragmentResult,
  type IntentStatusType,
} from "@/lib/api/gql";
import { fetchUserIntents, fetchUserIntentsCount } from "@/lib/fetchers";

export interface IntentRow {
  intent: IntentItemFragmentResult;
  intentId: bigint;
  isActive: boolean;
  isExpired: boolean;
  botSubscribed: boolean;
}

export interface IntentsDataContextValue {
  pageIntentRows: IntentRow[];
  totalRowCount: number;
  isLoading: boolean;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  statusFilter?: IntentStatusType;
  setStatusFilter: Dispatch<SetStateAction<IntentStatusType | undefined>>;
  refetch: () => Promise<unknown>;
  refetchFresh: () => Promise<unknown>;
}

export const IntentsDataContext = createContext<IntentsDataContextValue | null>(
  null
);

export const IntentsDataProvider = ({
  children,
  address,
}: {
  children: React.ReactNode;
  address: Address;
}) => {
  const queryClient = useQueryClient();
  const client = useClient();

  const chainId = useChainId();
  const { data: block } = useBlock();
  const chainBlockTimestamp = block?.timestamp;

  // Table pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Table status filter state
  const [statusFilter, setStatusFilter] = useState<
    IntentStatusType | undefined
  >();

  // Intents count
  const { data: intentsCount, isFetching: isFetchingIntentsCount } =
    useIntentsCount();

  // Intents (paginated)
  const { data: intents, isFetching: isFetchingIntents } = useIntentsQuery({
    user: address,
    status: statusFilter,
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

  const pageIntentRows = useMemo(() => {
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

  const userIntentsCountQueryKey = ["user-intents-count", address];
  const userIntentsQueryKey = [
    "user-intents",
    address,
    statusFilter,
    pagination.pageSize,
    pagination.pageIndex * pagination.pageSize,
  ];

  const refetch = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: userIntentsCountQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: userIntentsQueryKey,
      }),
      refetchBotStatuses(),
    ]);

  const refetchFresh = () =>
    Promise.all([
      queryClient.fetchQuery({
        queryKey: userIntentsCountQueryKey,
        queryFn: () =>
          fetchUserIntentsCount(client, {
            user: address,
            fresh: true,
          }),
      }),
      queryClient.fetchQuery({
        queryKey: userIntentsQueryKey,
        queryFn: () =>
          fetchUserIntents(client, {
            user: address,
            status: statusFilter,
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            fresh: true,
          }),
      }),
      refetchBotStatuses(),
    ]);

  return (
    <IntentsDataContext
      value={{
        pageIntentRows,
        totalRowCount: intentsCount?.total ?? 0,
        isLoading: isFetchingIntents || isFetchingIntentsCount,
        pagination,
        setPagination,
        statusFilter,
        setStatusFilter,
        refetch,
        refetchFresh,
      }}
    >
      {children}
    </IntentsDataContext>
  );
};

export const useIntentsData = () => {
  const context = useContext(IntentsDataContext);
  if (!context) {
    throw new Error(
      "useIntentsData must be used within an IntentsDataProvider"
    );
  }
  return context;
};
