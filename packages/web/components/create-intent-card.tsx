/** biome-ignore-all lint/correctness/noChildrenProp: false positive */
"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useRef, useState } from "react";
import { erc20Abi, isAddress, parseEther } from "viem";
import { useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { z } from "zod";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import {
  intentExecutorContractSepolia,
  intentFactoryContractSepolia,
} from "@/lib/contracts";

const createIntentFormSchema = z.object({
  tokenFrom: z
    .string()
    .min(1, "Token from address is required")
    .refine((val) => isAddress(val), "Invalid address"),
  tokenTo: z
    .string()
    .min(1, "Token to address is required")
    .refine((val) => isAddress(val), "Invalid address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      try {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      } catch {
        return false;
      }
    }, "Amount must be a positive number"),
  priceThreshold: z
    .string()
    .min(1, "Price threshold is required")
    .refine((val) => {
      try {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      } catch {
        return false;
      }
    }, "Price threshold must be a positive number"),
  expirationDate: z
    .string()
    .min(1, "Expiration date is required")
    .refine((val) => {
      const date = new Date(val);
      return date.getTime() > Date.now();
    }, "Expiration date must be in the future"),
  expirationTime: z.string().min(1, "Expiration time is required"),
});

type CreateIntentFormValues = z.infer<typeof createIntentFormSchema>;

export function CreateIntentCard() {
  const [open, setOpen] = useState(false);
  const formValuesRef = useRef<CreateIntentFormValues | undefined>(undefined);

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
        // gas: BigInt(300_000),
      });
    },
    messages: {
      sending: "Creating intent...",
      waiting: "Waiting for transaction to be confirmed...",
      refetching: "Transaction confirmed, refetching intents data...",
      success: formValuesRef.current
        ? `Intent created successfully for token pair: ${formValuesRef.current.tokenFrom}/${formValuesRef.current.tokenTo}`
        : "Intent created successfully",
    },
    refetch: refetchIntentIds,
    onSuccess: () => {
      form.reset();
      formValuesRef.current = undefined;
    },
  });

  const form = useForm({
    defaultValues: {
      tokenFrom: "",
      tokenTo: "",
      amount: "",
      priceThreshold: "",
      expirationDate: "",
      expirationTime: format(new Date(), "HH:mm:ss"),
    },
    validators: {
      onSubmit: createIntentFormSchema,
    },
    onSubmit: async ({ value }) => {
      const formValue = value as CreateIntentFormValues;
      formValuesRef.current = formValue;
      await execute();
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="create-intent-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Token From</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0x123..."
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="tokenFrom"
            />
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Token To</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0x123..."
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="tokenTo"
            />
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="100"
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="amount"
            />
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Price Threshold
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="7.89"
                      type="text"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="priceThreshold"
            />
            <div className="flex gap-8">
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Expiration Date
                      </FieldLabel>
                      <Popover onOpenChange={setOpen} open={open}>
                        <PopoverTrigger asChild>
                          <Button
                            className="w-32 justify-between font-normal"
                            id={field.name}
                            variant="outline"
                          >
                            {field.state.value
                              ? format(field.state.value, "PPP")
                              : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-auto overflow-hidden p-0"
                        >
                          <Calendar
                            captionLayout="dropdown"
                            mode="single"
                            onSelect={(date) => {
                              field.handleChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              );
                              setOpen(false);
                            }}
                            selected={new Date(field.state.value)}
                          />
                        </PopoverContent>
                      </Popover>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
                name="expirationDate"
              />
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field className="w-32" data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Time</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        step="1"
                        type="time"
                        value={field.state.value}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
                name="expirationTime"
              />
            </div>
          </FieldGroup>
        </form>
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
