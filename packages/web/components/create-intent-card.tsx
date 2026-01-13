/** biome-ignore-all lint/correctness/noChildrenProp: false positive */
"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { isAddress, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { z } from "zod";
import { useIntentIds } from "@/components/providers/intent-ids-provider";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { useMyWriteContract } from "@/hooks/use-my-write-contract";
import { intentFactoryContractSepolia } from "@/lib/contracts";

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
  expiration: z
    .string()
    .min(1, "Expiration time is required")
    .refine((val) => {
      const date = new Date(val);
      return date.getTime() > Date.now();
    }, "Expiration time must be in the future"),
});

type CreateIntentFormValues = z.infer<typeof createIntentFormSchema>;

export function CreateIntentCard() {
  const [formValues, setFormValues] = useState<
    CreateIntentFormValues | undefined
  >();
  const { mutateAsync } = useWriteContract();
  const { refetchIntentIds } = useIntentIds();

  const { execute, isPending } = useMyWriteContract({
    mutateAsyncFn: () => {
      if (!formValues) {
        throw new Error("Form values not set");
      }

      const tokenFrom = formValues.tokenFrom;
      const tokenTo = formValues.tokenTo;
      const amount = parseEther(formValues.amount);
      const priceThreshold = parseEther(formValues.priceThreshold);
      const expiration = BigInt(
        Math.floor(new Date(formValues.expiration).getTime() / 1000)
      );

      return mutateAsync({
        ...intentFactoryContractSepolia,
        functionName: "createIntent",
        args: [tokenFrom, tokenTo, amount, priceThreshold, expiration],
        gas: BigInt(300_000),
      });
    },
    messages: {
      sending: "Creating intent...",
      waiting: "Waiting for transaction to be confirmed...",
      refetching: "Transaction confirmed, refetching intents data...",
      success: formValues
        ? `Intent created successfully for token pair: ${formValues.tokenFrom}/${formValues.tokenTo}`
        : "Intent created successfully",
    },
    refetch: refetchIntentIds,
    onSuccess: () => {
      form.reset();
      setFormValues(undefined);
    },
  });

  const form = useForm({
    defaultValues: {
      tokenFrom: "",
      tokenTo: "",
      amount: "",
      priceThreshold: "",
      expiration: "",
    },
    validators: {
      onSubmit: createIntentFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormValues(value as CreateIntentFormValues);
      await execute();
    },
  });

  return (
    <Card className="w-2xl">
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
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Expiration</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="2025-01-01T12:00"
                      type="datetime-local"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="expiration"
            />
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
