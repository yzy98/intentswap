"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useChainId, useConfig } from "wagmi";
import {
  type WriteContractReturnType,
  waitForTransactionReceipt,
} from "wagmi/actions";

type Awaitable<T> = T | PromiseLike<T>;

export class IndexingTimeoutError extends Error {
  constructor(message = "Indexing timeout") {
    super(message);
    this.name = "IndexingTimeoutError";
  }
}

export interface UseMyWriteContractOptions {
  mutateAsyncFn: () => Promise<WriteContractReturnType>;
  waitForIndexed?: (txHash: `0x${string}`, chainId?: number) => Promise<void>;
  messages?: {
    sending?: string;
    waiting?: string;
    indexing?: string;
    success?: string;
    error?: string | ((error: unknown) => string);
  };
  onSuccess?: () => Awaitable<void>;
  onError?: (error: unknown) => Awaitable<void>;
  onFinally?: () => Awaitable<void>;
}

export function useMyWriteContract({
  mutateAsyncFn,
  waitForIndexed,
  messages = {},
  onSuccess,
  onError,
  onFinally,
}: UseMyWriteContractOptions) {
  const [isPending, setIsPending] = useState(false);
  const config = useConfig();
  const chainId = useChainId();

  const defaultMessages = {
    sending: "Sending transaction...",
    waiting: "Waiting for transaction to be confirmed...",
    indexing: "Waiting for indexed data...",
    success: "Transaction completed successfully",
    error: (error: unknown) =>
      error instanceof Error ? error.message : "Transaction failed",
    ...messages,
  };

  const waitForConfirmedTransaction = async (
    txHash: `0x${string}`,
    toastId: string | number
  ) => {
    toast.loading(defaultMessages.waiting, { id: toastId });

    const receipt = await waitForTransactionReceipt(config, {
      hash: txHash,
    });

    if (receipt.status === "reverted") {
      throw new Error("Transaction reverted");
    }
  };

  const waitForIndexedData = async (
    txHash: `0x${string}`,
    toastId: string | number
  ) => {
    if (!waitForIndexed) {
      return;
    }

    toast.loading(defaultMessages.indexing, { id: toastId });
    try {
      await waitForIndexed(txHash, chainId);
    } catch (error) {
      throw new IndexingTimeoutError(
        error instanceof Error ? error.message : "Indexing timeout"
      );
    }
  };

  const handleExecutionError = async (
    error: unknown,
    toastId: string | number
  ) => {
    // Transaction succeeded but indexing failed or timed out
    if (error instanceof IndexingTimeoutError) {
      toast.error(
        "Transaction confirmed on-chain, but indexing is delayed. Please refresh in a moment.",
        { id: toastId }
      );
      await onError?.(error);
      return;
    }

    // Transaction failed or was reverted
    const errorMessage =
      typeof defaultMessages.error === "function"
        ? defaultMessages.error(error)
        : defaultMessages.error || "Transaction failed";
    toast.error(errorMessage, { id: toastId });
    await onError?.(error);
  };

  const execute = async () => {
    setIsPending(true);
    const toastId = toast.loading(defaultMessages.sending);

    try {
      const txHash = await mutateAsyncFn();
      await waitForConfirmedTransaction(txHash, toastId);
      await waitForIndexedData(txHash, toastId);
      toast.success(defaultMessages.success, { id: toastId });
      await onSuccess?.();
    } catch (error) {
      await handleExecutionError(error, toastId);
    } finally {
      setIsPending(false);
      await onFinally?.();
    }
  };

  return {
    execute,
    isPending,
  };
}
