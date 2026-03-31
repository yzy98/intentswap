import { useMutation } from "@tanstack/react-query";
import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useChainId, useConfig, useConnection, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IndexingTimeoutError } from "@/hooks/use-my-write-contract";
import { useWaitForIndexed } from "@/hooks/use-wait-for-indexed";
import { subscribeBotOrNot } from "@/lib/api/bot";
import { intentFactoryContract } from "@/lib/constants";

interface RowActionsProps {
  intentId: bigint;
  isActive: boolean;
  botSubscribed: boolean;
  refetch?: () => Promise<unknown>;
}

export const RowActions = ({
  intentId,
  isActive,
  botSubscribed,
  refetch,
}: RowActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { mutateAsync } = useWriteContract();
  const { address } = useConnection();
  const chainId = useChainId();
  const config = useConfig();

  const { mutateAsync: unsubscribe } = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      await subscribeBotOrNot({
        subscribe: false,
        intentId,
        chainId,
        user: address,
      });
    },
  });

  const { waitForIndexed } = useWaitForIndexed({ eventType: "CANCELLED" });

  const mutateAsyncFn = async () => {
    return await mutateAsync({
      ...intentFactoryContract,
      functionName: "cancelIntent",
      args: [intentId],
    });
  };

  const waitForConfirmedTransaction = async (
    txHash: `0x${string}`,
    toastId: string | number
  ) => {
    toast.loading("Waiting for transaction to be confirmed...", {
      id: toastId,
    });

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
    toast.loading("Waiting for cancelled intent to be indexed...", {
      id: toastId,
    });
    try {
      await waitForIndexed(txHash, chainId);
    } catch (error) {
      throw new IndexingTimeoutError(
        error instanceof Error ? error.message : "Indexing timeout"
      );
    }
  };

  const disableBot = async (toastId: string | number) => {
    if (!botSubscribed) {
      return;
    }

    toast.loading("Disabling bot auto-execution...", { id: toastId });
    await unsubscribe();
  };

  const handleExecutionError = (error: unknown, toastId: string | number) => {
    // Transaction succeeded but indexing failed or timed out
    if (error instanceof IndexingTimeoutError) {
      toast.error(
        "Transaction confirmed on-chain, but indexing is delayed. Please refresh in a moment.",
        { id: toastId }
      );
      return;
    }

    // Transaction failed or was reverted
    toast.error(error instanceof Error ? error.message : "Failed to cancel", {
      id: toastId,
    });
  };

  const handleCancelIntent = async () => {
    setIsPending(true);
    const toastId = toast.loading("Sending cancel transaction...");

    try {
      const txHash = await mutateAsyncFn();
      await waitForConfirmedTransaction(txHash, toastId);
      await disableBot(toastId);
      await waitForIndexedData(txHash, toastId);
      toast.success("Intent cancelled successfully", { id: toastId });
      await refetch?.();
    } catch (error) {
      handleExecutionError(error, toastId);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu modal={false} onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open action dropdown menu"
          size="icon-sm"
          variant="ghost"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!isActive || isPending}
            onSelect={handleCancelIntent}
          >
            Cancel
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
