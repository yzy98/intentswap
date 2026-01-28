import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useChainId, useConnection, useWriteContract } from "wagmi";
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
import {
  type UseMyWriteContractOptions,
  useMyWriteContract,
} from "@/hooks/use-my-write-contract";
import {
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
} from "@/lib/constants";

const BOT_SUBSCRIBE_URL = "http://localhost:8787/subscribe";

interface RowActionsProps {
  intentId: bigint;
  isActive: boolean;
  canExecute: boolean;
  refetch?: () => Promise<unknown>;
}

export const RowActions = ({
  intentId,
  isActive,
  canExecute,
  refetch,
}: RowActionsProps) => {
  const { address } = useConnection();
  const chainId = useChainId();
  const { mutateAsync } = useWriteContract();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribeBot = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch(BOT_SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: intentId.toString(),
          chainId,
          user: address,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = errorBody?.error ?? "Failed to subscribe bot";
        throw new Error(message);
      }

      toast.success("Bot subscribed to this intent");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Subscribe failed";
      toast.error(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
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
          <WrappedDropdownMenuItem
            isDisabled={!canExecute}
            messages={{
              refetching: "Transaction confirmed, refetching intent data...",
              success: "Intent executed successfully",
            }}
            mutateAsyncFn={() =>
              mutateAsync({
                ...intentExecutorContractSepolia,
                functionName: "executeIntent",
                args: [intentId],
              })
            }
            refetch={refetch}
            text="Execute"
          />
          <WrappedDropdownMenuItem
            isDisabled={!isActive}
            messages={{
              refetching: "Transaction confirmed, refetching intent data...",
              success: "Intent cancelled successfully",
            }}
            mutateAsyncFn={() =>
              mutateAsync({
                ...intentFactoryContractSepolia,
                functionName: "cancelIntent",
                args: [intentId],
              })
            }
            refetch={refetch}
            text="Cancel"
          />
          <DropdownMenuItem
            disabled={!canExecute || isSubscribing}
            onSelect={handleSubscribeBot}
          >
            {isSubscribing ? "Subscribing..." : "Bot"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const WrappedDropdownMenuItem = ({
  text,
  isDisabled,
  mutateAsyncFn,
  refetch,
  messages,
  onSuccess,
  onError,
  onFinally,
}: { text: string; isDisabled?: boolean } & UseMyWriteContractOptions) => {
  const { execute, isPending } = useMyWriteContract({
    mutateAsyncFn,
    refetch,
    messages,
    onSuccess,
    onError,
    onFinally,
  });

  return (
    <DropdownMenuItem disabled={isDisabled || isPending} onSelect={execute}>
      {text}
    </DropdownMenuItem>
  );
};
