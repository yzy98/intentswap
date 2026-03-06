"use client";

import { useCallback, useRef, useState } from "react";
import { erc20Abi, parseEther } from "viem";
import { useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useCreateIntentForm } from "@/hooks/use-create-intent-form";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import {
  intentExecutorContract,
  intentFactoryContract,
  oracleContract,
} from "@/lib/constants";
import {
  type CreateIntentFormParsedValues,
  createIntentFormSchema,
} from "@/lib/types";
import { getTokenByAddress } from "@/lib/utils";
import { CreateIntentForm } from "./form";

interface CreateIntentDialogProps {
  triggerButton: React.ReactNode;
}

export function CreateIntentDialog({ triggerButton }: CreateIntentDialogProps) {
  const [open, setOpen] = useState(false);

  const formValuesRef = useRef<CreateIntentFormParsedValues | undefined>(
    undefined
  );

  const { mutateAsync } = useWriteContract();
  const { refetchIntentIds } = useIntentIds();
  const { address } = useConnection();
  const config = useConfig();

  const { execute, isPending } = useMyWriteContract({
    mutateAsyncFn: async () => {
      if (!formValuesRef.current) {
        throw new Error("Form values not set");
      }

      const currentValues = formValuesRef.current;
      const tokenFrom = currentValues.tokenFrom;
      const tokenTo = currentValues.tokenTo;
      const amount = parseEther(currentValues.amount);
      const priceThreshold = parseEther(currentValues.priceThreshold);
      const combined = `${currentValues.expirationDate}T${currentValues.expirationTime}`;
      const expiration = BigInt(
        Math.floor(new Date(combined).getTime() / 1000)
      );

      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Check if price feed exists for this token pair
      const hasFeed = await readContract(config, {
        ...oracleContract,
        functionName: "hasFeed",
        args: [tokenFrom, tokenTo],
      });

      if (!hasFeed) {
        const tokenFromSymbol =
          getTokenByAddress(tokenFrom)?.symbol ?? tokenFrom;
        const tokenToSymbol = getTokenByAddress(tokenTo)?.symbol ?? tokenTo;
        throw new Error(
          `No price feed available for ${tokenFromSymbol}/${tokenToSymbol}. Intent cannot be executed.`
        );
      }

      // Check if IntentExecutor has enough allowance of tokenFrom
      const allowance = await readContract(config, {
        abi: erc20Abi,
        address: tokenFrom,
        functionName: "allowance",
        args: [address, intentExecutorContract.address],
      });

      if (allowance < amount) {
        const txHash = await mutateAsync({
          abi: erc20Abi,
          address: tokenFrom,
          functionName: "approve",
          args: [intentExecutorContract.address, amount],
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        if (receipt.status === "reverted") {
          throw new Error("Failed to approve allowance");
        }
      }

      return mutateAsync({
        ...intentFactoryContract,
        functionName: "createIntent",
        args: [tokenFrom, tokenTo, amount, priceThreshold, expiration],
      });
    },
    messages: {
      sending: "Creating intent...",
      waiting: "Waiting for transaction to be confirmed...",
      refetching: "Transaction confirmed, refetching intents data...",
      success: formValuesRef.current
        ? `Intent created successfully for ${getTokenByAddress(formValuesRef.current.tokenFrom)?.symbol ?? "token"}/${getTokenByAddress(formValuesRef.current.tokenTo)?.symbol ?? "token"}`
        : "Intent created successfully",
    },
    refetch: refetchIntentIds,
    onSuccess: () => {
      form.reset();
      formValuesRef.current = undefined;
      setOpen(false);
    },
  });

  const form = useCreateIntentForm({
    onSubmit: async ({ value }) => {
      formValuesRef.current = createIntentFormSchema.parse(value);
      await execute();
    },
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        form.reset();
        formValuesRef.current = undefined;
      }
    },
    [form]
  );

  return (
    <ResponsiveDialog onOpenChange={handleOpenChange} open={open}>
      <ResponsiveDialogTrigger asChild>{triggerButton}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="md:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create Intent</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Set up a new swap intent with your desired tokens, amount, price
            threshold, and expiration.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="overflow-y-auto px-4 md:px-0">
          <CreateIntentForm form={form} />
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button disabled={isPending} type="button" variant="outline">
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button disabled={isPending} form="create-intent-form" type="submit">
            {isPending && <Spinner />}
            Create
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
