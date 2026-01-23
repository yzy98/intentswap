import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import {
  type CreateIntentFormValues,
  createIntentFormSchema,
} from "@/lib/types";

const CREATE_INTENT_DEFAULT_VALUES: CreateIntentFormValues = {
  tokenFrom: "",
  tokenTo: "",
  amount: "",
  priceThreshold: "",
  expirationDate: "",
  expirationTime: format(new Date(), "HH:mm:ss"),
};

export function useCreateIntentForm(opts: {
  onSubmit: (args: { value: CreateIntentFormValues }) => void | Promise<void>;
}) {
  return useForm({
    defaultValues: CREATE_INTENT_DEFAULT_VALUES,
    validators: {
      onSubmit: createIntentFormSchema,
    },
    onSubmit: opts.onSubmit,
  });
}

export type CreateIntentFormType = ReturnType<typeof useCreateIntentForm>;
