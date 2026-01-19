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
import { getIntentStatusEnumFromString } from "@/lib/utils";
import { useTableRow } from "./table-row-provider";

export const IntentActionDropdownMenu = () => {
  const { mutateAsync } = useWriteContract();
  const { intent, intentId, refetchIntent } = useTableRow();

  const isIntentActive =
    intent.status === getIntentStatusEnumFromString("Active");

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
            isDisabled={!isIntentActive}
            messages={{
              refetching: "Transaction confirmed, refetching intent data...",
              success: `Intent ${intentId} executed successfully`,
            }}
            mutateAsyncFn={() =>
              mutateAsync({
                ...intentExecutorContractSepolia,
                functionName: "executeIntent",
                args: [intentId],
              })
            }
            refetch={refetchIntent}
            text="Execute"
          />
          <WrappedDropdownMenuItem
            isDisabled={!isIntentActive}
            messages={{
              refetching: "Transaction confirmed, refetching intent data...",
              success: `Intent ${intentId} cancelled successfully`,
            }}
            mutateAsyncFn={() =>
              mutateAsync({
                ...intentFactoryContractSepolia,
                functionName: "cancelIntent",
                args: [intentId],
              })
            }
            refetch={refetchIntent}
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

  // [FIXME] Execute intent ❌, something wrong in the contract

  return (
    <DropdownMenuItem disabled={isDisabled || isPending} onSelect={execute}>
      {text}
    </DropdownMenuItem>
  );
};
