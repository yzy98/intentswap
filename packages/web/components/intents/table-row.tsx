import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
} from "@/lib/contracts";
import type { Address, IntentStatusNumber } from "@/lib/types";
import { getIntentStatusFromEnum, getTokenByAddress } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { IntentActionDropdownMenu } from "./action-dropdown-menu";
import { TableRowProvider, useTableRow } from "./table-row-provider";

interface IntentsTableRowProps {
  intentId: bigint;
}

export const IntentsTableRow = ({ intentId }: IntentsTableRowProps) => {
  const { data: intent } = useReadContract({
    ...intentFactoryContractSepolia,
    functionName: "getIntent",
    args: [intentId],
  });

  const { data: poolKeyData } = useReadContract({
    ...intentExecutorContractSepolia,
    functionName: "getPoolKey",
    args: [intent?.tokenFrom as Address, intent?.tokenTo as Address],
  });

  if (!(intent && poolKeyData)) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRowProvider
      intent={intent}
      intentId={intentId}
      isPoolKeySet={poolKeyData[1]}
    >
      <IntentsTableRowDetails />
    </TableRowProvider>
  );
};

const IntentsTableRowDetails = () => {
  const { intent, isPoolKeySet, isEditing, setIsEditing } = useTableRow();

  const intentStatus = getIntentStatusFromEnum(
    intent.status as IntentStatusNumber
  );

  const isIntentActive = intentStatus === "Active";

  const intentStatusVariant = useMemo(() => {
    if (intentStatus === "Active") {
      return "active";
    }
    if (intentStatus === "Executed") {
      return "destructive";
    }
    return "secondary";
  }, [intentStatus]);

  const handleSaveEditing = () => {
    // [TODO] Call contract function to save editing
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    // [TODO] Render dialog to confirm cancellation
    setIsEditing(false);
  };

  return (
    <TableRow>
      <TableCell>{getTokenByAddress(intent.tokenFrom)?.symbol}</TableCell>
      <TableCell>{getTokenByAddress(intent.tokenTo)?.symbol}</TableCell>
      <TableCell>{formatEther(intent.amount)}</TableCell>
      <TableCell>
        {isEditing ? (
          <InputGroup>
            <InputGroupInput
              autoFocus
              defaultValue={formatEther(intent.priceThreshold)}
              onBlur={handleCancelEditing}
              size={4}
            />
            <InputGroupAddon align="inline-end" className="gap-0">
              <InputGroupButton
                onClick={handleSaveEditing}
                size="icon-xs"
                variant="default"
              >
                <CheckIcon />
              </InputGroupButton>
              <InputGroupButton
                onClick={handleCancelEditing}
                size="icon-xs"
                variant="secondary"
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <div className="flex items-center gap-1">
            <span>{formatEther(intent.priceThreshold)}</span>
            {isIntentActive && (
              <Button
                onClick={() => setIsEditing(true)}
                size="icon-xs"
                variant="ghost"
              >
                <PencilIcon />
              </Button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={intentStatusVariant}>{intentStatus}</Badge>
      </TableCell>
      <TableCell className="text-right">
        {new Date(Number(intent.expiration) * 1000).toLocaleString()}
      </TableCell>
      <TableCell>
        {isPoolKeySet ? (
          <Badge className="size-5 rounded-full p-0" variant="active">
            <CheckIcon />
          </Badge>
        ) : (
          <Badge className="size-5 rounded-full p-0" variant="destructive">
            <XIcon />
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <IntentActionDropdownMenu />
      </TableCell>
    </TableRow>
  );
};
