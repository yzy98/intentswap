import { MoreVerticalIcon } from "lucide-react";
import { useWriteContract } from "wagmi";
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
} from "@/lib/contracts";

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
  const { mutateAsync } = useWriteContract();

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
