/** biome-ignore-all lint/style/noNestedTernary: Ignore */

import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { erc20Abi } from "viem";
import { useBlock, useReadContracts } from "wagmi";
import { DataTable } from "@/components/intents/table/data-table";
import {
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
} from "@/lib/constants";
import type { IntentRow } from "@/lib/types";
import { getExecutionBlockReason, getReadContractsResult } from "@/lib/utils";
import { columns } from "./columns";

interface Props {
  intentIds: readonly bigint[];
  isLoadingIntentIds: boolean;
}

export const IntentsTable = ({ intentIds, isLoadingIntentIds }: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const { data: block } = useBlock();
  const chainBlockTimestamp = block?.timestamp;

  // Slice current page intent ids
  const currentPageIntentIds = useMemo(() => {
    return intentIds.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );
  }, [intentIds, pagination.pageIndex, pagination.pageSize]);

  // Get current page all intents data
  const {
    data: currentPageIntents,
    isLoading: isLoadingIntents,
    refetch: refetchCurrentPageIntents,
  } = useReadContracts({
    contracts: currentPageIntentIds.map((intentId) => ({
      ...intentFactoryContractSepolia,
      functionName: "getIntent" as const,
      args: [intentId] as const,
    })),
    allowFailure: false,
  });

  // Balances of tokenFrom of current page intents
  const {
    data: currentPageTokenFromBalances,
    isLoading: isLoadingBalances,
    refetch: refetchCurrentPageTokenFromBalances,
  } = useReadContracts({
    contracts:
      currentPageIntents?.map((intent) => ({
        abi: erc20Abi,
        address: intent.tokenFrom,
        functionName: "balanceOf" as const,
        args: [intent.user] as const,
      })) ?? [],
    query: { enabled: !!currentPageIntents?.length },
  });

  // Allowances of tokenFrom of current page intents
  const {
    data: currentPageTokenFromAllowances,
    isLoading: isLoadingAllowances,
    refetch: refetchCurrentPageTokenFromAllowances,
  } = useReadContracts({
    contracts:
      currentPageIntents?.map((intent) => ({
        abi: erc20Abi,
        address: intent.tokenFrom,
        functionName: "allowance" as const,
        args: [intent.user, intentExecutorContractSepolia.address] as const,
      })) ?? [],
    query: { enabled: !!currentPageIntents?.length },
  });

  const currentPageData: IntentRow[] = useMemo(() => {
    if (
      !(
        currentPageIntents &&
        currentPageTokenFromBalances &&
        currentPageTokenFromAllowances
      )
    ) {
      return [];
    }

    return currentPageIntentIds.map((intentId, i) => {
      const intent = currentPageIntents[i];
      const balanceEntry = currentPageTokenFromBalances[i];
      const allowanceEntry = currentPageTokenFromAllowances[i];
      const balance = getReadContractsResult(balanceEntry);
      const allowance = getReadContractsResult(allowanceEntry);

      const isActive = intent.status === 0;
      const isExpired =
        isActive &&
        chainBlockTimestamp !== undefined &&
        intent.expiration <= chainBlockTimestamp;
      const hasBalance = balance !== undefined && balance >= intent.amount;
      const hasAllowance =
        allowance !== undefined && allowance >= intent.amount;
      const canExecute = isActive && !isExpired && hasBalance && hasAllowance;
      const executionBlockReason = getExecutionBlockReason(
        isActive,
        isExpired,
        hasBalance,
        hasAllowance,
        balanceEntry?.status,
        allowanceEntry?.status
      );

      return {
        intentId,
        intent,
        isActive,
        isExpired,
        hasBalance,
        hasAllowance,
        canExecute,
        executionBlockReason,
      };
    });
  }, [
    currentPageIntentIds,
    currentPageIntents,
    currentPageTokenFromBalances,
    currentPageTokenFromAllowances,
    chainBlockTimestamp,
  ]);

  const refetchPage = () =>
    Promise.all([
      refetchCurrentPageIntents(),
      refetchCurrentPageTokenFromBalances(),
      refetchCurrentPageTokenFromAllowances(),
    ]);

  return (
    <DataTable
      columns={columns}
      data={currentPageData}
      isLoading={
        isLoadingIntentIds ||
        isLoadingIntents ||
        isLoadingBalances ||
        isLoadingAllowances
      }
      pagination={pagination}
      refetchPage={refetchPage}
      rowCount={intentIds.length}
      setPagination={setPagination}
    />
  );
};
