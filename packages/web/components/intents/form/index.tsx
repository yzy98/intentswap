"use client";

import { format } from "date-fns";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
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
import type { CreateIntentFormType } from "@/hooks/use-create-intent-form";
import { bySymbol } from "@/lib/constants";

export interface CreateIntentFormProps {
  form: CreateIntentFormType;
}

export function CreateIntentForm({ form }: CreateIntentFormProps) {
  const [open, setOpen] = useState(false);

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
          </div>
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
                    placeholder="7.89"
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
