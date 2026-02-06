"use client";

import { useRef } from "react";
import { erc20Abi, parseEther } from "viem";
import { useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useCreateIntentForm } from "@/hooks/use-create-intent-form";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import {
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
  oracleContractSepolia,
} from "@/lib/constants";
import {
  type CreateIntentFormParsedValues,
  createIntentFormSchema,
} from "@/lib/types";
import { getTokenByAddress } from "@/lib/utils";
import { CreateIntentForm } from "./form";

export function CreateIntentCard() {
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
        ...oracleContractSepolia,
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
        args: [address, intentExecutorContractSepolia.address],
      });

      if (allowance < amount) {
        const txHash = await mutateAsync({
          abi: erc20Abi,
          address: tokenFrom,
          functionName: "approve",
          args: [intentExecutorContractSepolia.address, amount],
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        if (receipt.status === "reverted") {
          throw new Error("Failed to approve allowance");
        }
      }

      return mutateAsync({
        ...intentFactoryContractSepolia,
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
    },
  });

  const form = useCreateIntentForm({
    onSubmit: async ({ value }) => {
      formValuesRef.current = createIntentFormSchema.parse(value);
      await execute();
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateIntentForm form={form} />
      </CardContent>
      <CardFooter>
        <Field className="w-full justify-end" orientation="horizontal">
          <Button
            disabled={isPending}
            onClick={() => form.reset()}
            type="button"
            variant="outline"
          >
            Reset
          </Button>
          <Button disabled={isPending} form="create-intent-form" type="submit">
            {isPending && <Spinner />}
            Create Intent
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
