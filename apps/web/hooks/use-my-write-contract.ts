"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConfig } from "wagmi";
import {
  type WriteContractReturnType,
  waitForTransactionReceipt,
} from "wagmi/actions";

export interface UseMyWriteContractOptions {
  mutateAsyncFn: () => Promise<WriteContractReturnType>;
  refetch?: () => Promise<unknown>;
  messages?: {
    sending?: string;
    waiting?: string;
    refetching?: string;
    success?: string;
    error?: string | ((error: unknown) => string);
  };
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
}

export function useMyWriteContract({
  mutateAsyncFn,
  refetch,
  messages = {},
  onSuccess,
  onError,
  onFinally,
}: UseMyWriteContractOptions) {
  const [isPending, setIsPending] = useState(false);

  const config = useConfig();

  const defaultMessages = {
    sending: "Sending transaction...",
    waiting: "Waiting for transaction to be confirmed...",
    refetching: "Transaction confirmed, refetching data...",
    success: "Transaction completed successfully",
    error: (error: unknown) =>
      error instanceof Error ? error.message : "Transaction failed",
    ...messages,
  };

  const execute = async () => {
    setIsPending(true);
    const toastId = toast.loading(defaultMessages.sending);

    try {
      // Step 1: Send transaction
      const txHash = await mutateAsyncFn();

      // Step 2: Wait for transaction confirmation
      toast.loading(defaultMessages.waiting, { id: toastId });

      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
      });

      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Step 3: Refetch data (if refetch function is provided)
      if (refetch) {
        toast.loading(defaultMessages.refetching, { id: toastId });
        await refetch();
      }

      // Step 4: Show success message
      toast.success(defaultMessages.success, { id: toastId });

      onSuccess?.();
    } catch (error) {
      // Show error message
      const errorMessage =
        typeof defaultMessages.error === "function"
          ? defaultMessages.error(error)
          : defaultMessages.error || "Transaction failed";
      toast.error(errorMessage, { id: toastId });

      onError?.(error);
    } finally {
      setIsPending(false);
      onFinally?.();
    }
  };

  return {
    execute,
    isPending,
  };
}
