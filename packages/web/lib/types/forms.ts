import { isAddress } from "viem";
import { z } from "zod";

export const createIntentFormSchema = z.object({
  tokenFrom: z
    .string()
    .min(1, "Please select a token to swap from")
    .refine((val) => isAddress(val)),
  tokenTo: z
    .string()
    .min(1, "Please select a token to swap to")
    .refine((val) => isAddress(val)),
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

export type CreateIntentFormValues = z.input<typeof createIntentFormSchema>;
export type CreateIntentFormParsedValues = z.output<
  typeof createIntentFormSchema
>;

export const setFeedFormSchema = z.object({
  tokenFrom: z
    .string()
    .min(1, "Please select a token to set the feed from")
    .refine((val) => isAddress(val)),
  tokenTo: z
    .string()
    .min(1, "Please select a token to set the feed to")
    .refine((val) => isAddress(val)),
  feed: z
    .string()
    .min(1, "Please select a feed to set")
    .refine((val) => isAddress(val)),
});

export type SetFeedFormValues = z.input<typeof setFeedFormSchema>;
export type SetFeedFormParsedValues = z.output<typeof setFeedFormSchema>;
