import { CheckIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import { intentFactoryContractSepolia } from "@/lib/contracts";

interface PriceThresholdCellProps {
  priceThreshold: bigint;
  isActive: boolean;
  intentId: bigint;
  refetch?: () => Promise<unknown>;
}

export const PriceThresholdCell = ({
  priceThreshold,
  isActive,
  intentId,
  refetch,
}: PriceThresholdCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPriceThreshold, setNewPriceThreshold] = useState(
    formatEther(priceThreshold)
  );
  const { mutateAsync } = useWriteContract();

  const isPriceThresholdChanged =
    newPriceThreshold !== formatEther(priceThreshold);

  useEffect(() => {
    if (!isEditing) {
      setNewPriceThreshold(formatEther(priceThreshold));
    }
  }, [priceThreshold, isEditing]);

  const { execute: handleSaveEditing, isPending: isUpdatingPriceThreshold } =
    useMyWriteContract({
      mutateAsyncFn: () => {
        const trimmed = newPriceThreshold.trim();
        if (!trimmed) {
          throw new Error("Price threshold is required");
        }
        const value = Number.parseFloat(trimmed);
        if (Number.isNaN(value) || value <= 0) {
          throw new Error("Invalid price threshold");
        }

        return mutateAsync({
          ...intentFactoryContractSepolia,
          functionName: "updateIntentCondition",
          args: [intentId, parseEther(trimmed)],
        });
      },
      refetch,
      messages: {
        sending: "Sending transaction...",
        waiting: "Waiting for transaction to be confirmed...",
        refetching: "Transaction confirmed, refetching intent data...",
        success: "Intent data updated successfully",
      },
      onFinally: () => {
        setNewPriceThreshold(formatEther(priceThreshold));
        setIsEditing(false);
      },
    });

  const handleCancelEditing = () => {
    if (isPriceThresholdChanged) {
      toast.info("Editing cancelled, price threshold not saved");
      setNewPriceThreshold(formatEther(priceThreshold));
    }
    setIsEditing(false);
  };

  return (
    <div>
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
          <span>{formatEther(priceThreshold)}</span>
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
    </div>
  );
};
