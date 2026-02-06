"use client";

import { format } from "date-fns";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { CreateIntentFormType } from "@/hooks/use-create-intent-form";
import { useHasFeed } from "@/hooks/use-has-feed";
import { useSafePrice } from "@/hooks/use-safe-price";
import { bySymbol } from "@/lib/constants";

export interface CreateIntentFormProps {
  form: CreateIntentFormType;
}

export interface CreateIntentFormContentProps {
  form: CreateIntentFormType;
  tokenFrom: Address;
  tokenTo: Address;
}

export function CreateIntentForm({ form }: CreateIntentFormProps) {
  return (
    <form.Subscribe
      selector={(state) => [state.values.tokenFrom, state.values.tokenTo]}
    >
      {([tokenFrom, tokenTo]) => (
        <CreateIntentFormContent
          form={form}
          tokenFrom={tokenFrom as Address}
          tokenTo={tokenTo as Address}
        />
      )}
    </form.Subscribe>
  );
}

function CreateIntentFormContent({
  form,
  tokenFrom,
  tokenTo,
}: CreateIntentFormContentProps) {
  const [open, setOpen] = useState(false);

  // Check if feed exists
  const { data: hasFeed, isLoading: isCheckingFeed } = useHasFeed(
    tokenFrom as Address,
    tokenTo as Address
  );

  // Get current price
  const { data: priceData } = useSafePrice(
    tokenFrom as Address,
    tokenTo as Address
  );

  // Calculate current price from Oracle data
  const currentPrice = useMemo(() => {
    if (!priceData) {
      return undefined;
    }
    const [price, decimals] = priceData;
    return Number(price) / 10 ** decimals;
  }, [priceData]);

  // Show feed status only when both tokens are selected and different
  const showFeedStatus = Boolean(tokenFrom && tokenTo && tokenFrom !== tokenTo);

  return (
    <form
      id="create-intent-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {/* Token Field Set */}
        <FieldSet>
          <FieldLabel>Tokens</FieldLabel>
          <FieldDescription>Select tokens to swap</FieldDescription>
          <div className="flex gap-4">
            <form.Field name="tokenFrom">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="min-w-[120px]"
                        id={field.name}
                      >
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectGroup>
                          {Object.values(bySymbol).map((token) => (
                            <SelectItem
                              key={token.address}
                              value={token.address}
                            >
                              {token.symbol}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <ArrowRightIcon className="size-8" />
            <form.Field name="tokenTo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="min-w-[120px]"
                        id={field.name}
                      >
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectGroup>
                          {/* Filter out tokenFrom to prevent same token selection */}
                          {Object.values(bySymbol)
                            .filter((token) => token.address !== tokenFrom)
                            .map((token) => (
                              <SelectItem
                                key={token.address}
                                value={token.address}
                              >
                                {token.symbol}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
          {/* Feed Status Display */}
          {showFeedStatus && (
            <div className="mt-2">
              {isCheckingFeed && (
                <Alert>
                  <Spinner />
                  <AlertTitle>Checking price feed...</AlertTitle>
                  <AlertDescription>
                    Only the token pair with a price feed can be used to create
                    an intent
                  </AlertDescription>
                </Alert>
              )}
              {!isCheckingFeed && hasFeed && (
                <Alert variant="active">
                  <CheckCircle2Icon />
                  <AlertTitle>Price feed available</AlertTitle>
                  <AlertDescription>Intent can be executed</AlertDescription>
                </Alert>
              )}
              {!(isCheckingFeed || hasFeed) && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>No price feed</AlertTitle>
                  <AlertDescription>Intent cannot be executed</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </FieldSet>
        <FieldSeparator />

        {/* Amount Field Set */}
        <FieldSet>
          <FieldLabel>Amount</FieldLabel>
          <FieldDescription>
            The amount of tokens to be swapped
          </FieldDescription>
          <form.Field name="amount">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldSet>
        <FieldSeparator />

        {/* Price Threshold Field Set */}
        <FieldSet>
          <FieldLabel>Price Threshold</FieldLabel>
          <FieldDescription>
            The minimum price at which the intent will execute
          </FieldDescription>
          <form.Field name="priceThreshold">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={
                      currentPrice ? currentPrice.toFixed(8) : "7.89"
                    }
                    type="text"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldSet>
        <FieldSeparator />

        {/* Expiration Field Set */}
        <FieldSet>
          <FieldLabel>Expiration</FieldLabel>
          <FieldDescription>
            The date and time at which the intent will expire
          </FieldDescription>
          <div className="flex gap-4">
            <form.Field name="expirationDate">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
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
            </form.Field>
            <form.Field name="expirationTime">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
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
            </form.Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
