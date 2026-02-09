"use client";

import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import { useConnection, useWriteContract } from "wagmi";
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
import { oracleContract } from "@/lib/constants";
import {
  type SetFeedFormParsedValues,
  type SetFeedFormValues,
  setFeedFormSchema,
} from "@/lib/types";

const SET_FEED_DEFAULT_VALUES: SetFeedFormValues = {
  tokenFrom: "",
  tokenTo: "",
  feed: "",
};

export const SetFeedCard = () => {
  const formValuesRef = useRef<SetFeedFormParsedValues | undefined>(undefined);

  const { mutateAsync } = useWriteContract();
  const { address } = useConnection();

  const { execute, isPending } = useMyWriteContract({
    mutateAsyncFn: () => {
      if (!formValuesRef.current) {
        throw new Error("Form values not set");
      }
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const currentValues = formValuesRef.current;
      const tokenFrom = currentValues.tokenFrom;
      const tokenTo = currentValues.tokenTo;
      const feed = currentValues.feed;

      return mutateAsync({
        ...oracleContract,
        functionName: "setFeed",
        args: [tokenFrom, tokenTo, feed],
      });
    },
    messages: {
      sending: "Seeding feed...",
      waiting: "Waiting for transaction to be confirmed...",
      success: formValuesRef.current
        ? `Feed set successfully for ${formValuesRef.current.tokenFrom}/${formValuesRef.current.tokenTo}`
        : "Feed set successfully",
    },
    onSuccess: () => {
      form.reset();
      formValuesRef.current = undefined;
    },
  });

  const form = useForm({
    defaultValues: SET_FEED_DEFAULT_VALUES,
    validators: {
      onSubmit: setFeedFormSchema,
    },
    onSubmit: async ({ value }) => {
      formValuesRef.current = setFeedFormSchema.parse(value);
      await execute();
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set Price Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="set-feed-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="tokenFrom">
              {(field) => {
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
            </form.Field>
            <form.Field name="tokenTo">
              {(field) => {
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
            </form.Field>
            <form.Field name="feed">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Feed</FieldLabel>
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
            </form.Field>
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
          <Button disabled={isPending} form="set-feed-form" type="submit">
            {isPending && <Spinner />}
            Set Feed
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};
