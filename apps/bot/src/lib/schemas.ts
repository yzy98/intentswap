import { isAddress } from "viem";
import { z } from "zod";

const BATCH_SIZE = 50;

const numericRegex = /^\d+$/;
const numericString = z
  .string()
  .regex(numericRegex, "Must be a numeric string");

export const subscribeJsonSchema = z.object({
  intentId: numericString,
  chainId: z.number().int().positive(),
  user: z.string().refine(isAddress, "Invalid address"),
});

export const statusQuerySchema = z.object({
  intentId: numericString,
  chainId: numericString,
});

export const statusBatchQuerySchema = z.object({
  intentIds: z
    .string()
    .min(1, "intentIds is required")
    .transform((v) =>
      v
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    )
    .refine((ids) => ids.length > 0, "IntentIds is required")
    .refine((ids) => ids.length <= BATCH_SIZE, "Too many intentIds, max 50")
    .refine(
      (ids) => ids.every((id) => numericRegex.test(id)),
      "All intentIds must be numeric"
    ),
  chainId: numericString,
});
