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
import { intentFactoryContract } from "@/lib/constants";

const BOT_API_URL =
  process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8787";

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

      const response = await fetch(`${BOT_API_URL}/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intentId: intentId.toString(),
          chainId,
          user: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to disable bot auto-execution");
      }

      return data;
    },
  });

  const handleCancelIntent = async () => {
    setIsPending(true);
    const toastId = toast.loading("Sending cancel transaction...");

    try {
      // Send cancel intent transaction
      const txHash = await mutateAsync({
        ...intentFactoryContract,
        functionName: "cancelIntent",
        args: [intentId],
      });

      // Wait for transaction confirmation
      toast.loading("Waiting for transaction to be confirmed...", {
        id: toastId,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
      });

      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // If bot auto-execution is enabled, unsubscribe from the intent
      if (botSubscribed) {
        toast.loading("Disabling bot auto-execution...", { id: toastId });
        await unsubscribe();
      }

      // If refetch function is provided, refetch the intent data
      if (refetch) {
        toast.loading("Transaction confirmed, refetching intent data...", {
          id: toastId,
        });
        await refetch();
      }

      toast.success("Intent cancelled successfully", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel", {
        id: toastId,
      });
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
