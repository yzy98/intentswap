import { CheckIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import { intentFactoryContractSepolia } from "@/lib/contracts";
import type { IntentStatusNumber } from "@/lib/types";
import { getIntentStatusFromEnum, getTokenByAddress } from "@/lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { IntentActions } from "./intent-actions";
import { TableRowProvider, useTableRow } from "./table-row-provider";

interface IntentsTableRowProps {
  intentId: bigint;
}

export const IntentsTableRow = ({ intentId }: IntentsTableRowProps) => {
  const { data: intent, refetch: refetchIntent } = useReadContract({
    ...intentFactoryContractSepolia,
    functionName: "getIntent",
    args: [intentId],
  });

  if (!intent) {
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
      refetchIntent={refetchIntent}
    >
      <IntentsTableRowDetails />
    </TableRowProvider>
  );
};

const IntentsTableRowDetails = () => {
  const { mutateAsync } = useWriteContract();
  const {
    intent,
    intentId,
    isEditing,
    setIsEditing,
    refetchIntent,
    isActive,
    executionBlockReason,
  } = useTableRow();

  const [newPriceThreshold, setNewPriceThreshold] = useState(
    formatEther(intent.priceThreshold)
  );

  const intentStatus = getIntentStatusFromEnum(
    intent.status as IntentStatusNumber
  );

  const isPriceThresholdChanged =
    newPriceThreshold !== formatEther(intent.priceThreshold);

  const intentStatusVariant = useMemo(() => {
    if (intentStatus === "Active") {
      return "active";
    }
    if (intentStatus === "Executed") {
      return "destructive";
    }
    return "secondary";
  }, [intentStatus]);

  const { execute: handleSaveEditing, isPending: isUpdatingPriceThreshold } =
    useMyWriteContract({
      mutateAsyncFn: () =>
        mutateAsync({
          ...intentFactoryContractSepolia,
          functionName: "updateIntentCondition",
          args: [intentId, parseEther(newPriceThreshold)],
        }),
      refetch: refetchIntent,
      messages: {
        sending: "Sending transaction...",
        waiting: "Waiting for transaction to be confirmed...",
        refetching: "Transaction confirmed, refetching intent data...",
        success: "Intent data updated successfully",
      },
      onFinally: () => {
        setNewPriceThreshold(formatEther(intent.priceThreshold));
        setIsEditing(false);
      },
    });

  const handleCancelEditing = () => {
    if (isPriceThresholdChanged) {
      toast.info("Editing cancelled, price threshold not saved");
      setNewPriceThreshold(formatEther(intent.priceThreshold));
    }
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
              disabled={isUpdatingPriceThreshold}
              onChange={(e) => setNewPriceThreshold(e.target.value)}
              size={4}
              value={newPriceThreshold}
            />
            <InputGroupAddon align="inline-end" className="gap-0">
              <InputGroupButton
                disabled={isUpdatingPriceThreshold}
                onClick={handleSaveEditing}
                size="icon-xs"
                variant="default"
              >
                {isUpdatingPriceThreshold ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CheckIcon />
                )}
              </InputGroupButton>
              <InputGroupButton
                disabled={isUpdatingPriceThreshold}
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
            {isActive && (
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
        <div className="flex items-center gap-2">
          <Badge variant={intentStatusVariant}>{intentStatus}</Badge>
          {executionBlockReason && (
            <Badge variant="secondary">{executionBlockReason}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {new Date(Number(intent.expiration) * 1000).toLocaleString()}
      </TableCell>
      <TableCell>
        <IntentActions />
      </TableCell>
    </TableRow>
  );
};
