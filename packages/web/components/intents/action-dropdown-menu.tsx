import { MoreVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import { zeroAddress } from "viem";
import { useWriteContract } from "wagmi";
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
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
} from "@/lib/contracts";
import { getIntentStatusEnumFromString } from "@/lib/utils";
import { Button } from "../ui/button";
import type { Intent } from "./table-row";

interface Props {
  intent: Intent;
  intentId: bigint;
}

export const IntentActionDropdownMenu = ({ intent, intentId }: Props) => {
  const { mutateAsync, isPending, error } = useWriteContract();

  const isIntentActive =
    intent.status === getIntentStatusEnumFromString("Active");

  const handleSetPoolKey = () => {
    toast.promise(
      mutateAsync({
        ...intentExecutorContractSepolia,
        functionName: "setPoolKey",
        args: [intent.tokenFrom, intent.tokenTo, 3000, 60, zeroAddress],
      }),
      {
        loading: "Setting pool key...",
        success: "Pool key set successfully",
        error: error?.message || "Failed to set pool key",
      }
    );
  };

  // [FIXME] Execute intent always fails
  const handleExecuteIntent = () => {
    toast.promise(
      mutateAsync({
        ...intentExecutorContractSepolia,
        functionName: "executeIntent",
        args: [intentId],
      }),
      {
        loading: "Executing intent...",
        success: `Intent ${intentId} executed successfully`,
        error: error?.message || "Failed to execute intent",
      }
    );
  };

  const handleCancelIntent = () => {
    toast.promise(
      mutateAsync({
        ...intentFactoryContractSepolia,
        functionName: "cancelIntent",
        args: [intentId],
      }),
      {
        loading: "Cancelling intent...",
        success: () => `Intent ${intentId} cancelled successfully`,
        error: error?.message || "Failed to cancel intent",
      }
    );
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
          <DropdownMenuItem disabled={isPending} onSelect={handleSetPoolKey}>
            Set Pool Key
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!isIntentActive || isPending}
            onSelect={handleExecuteIntent}
          >
            Execute
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Update</DropdownMenuItem>
          <DropdownMenuItem
            disabled={!isIntentActive || isPending}
            onSelect={handleCancelIntent}
          >
            Cancel
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
