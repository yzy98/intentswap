import type { intentFactoryAbi } from "@packages/contract-deployments";
import type { IntentStatusValue } from "@packages/db";
import { intent } from "@packages/db/schema";
import { eq } from "drizzle-orm";
import type { ParseEventLogsReturnType } from "viem";
import { db } from "@/clients/db-client";
import { normalizeAddress } from "@/utils";

type IntentFactoryLog = ParseEventLogsReturnType<
  typeof intentFactoryAbi
>[number];

type IntentCreatedLog = Extract<
  IntentFactoryLog,
  { eventName: "IntentCreated" }
>;
type IntentUpdatedLog = Extract<
  IntentFactoryLog,
  { eventName: "IntentUpdated" }
>;
type IntentExecutedLog = Extract<
  IntentFactoryLog,
  { eventName: "IntentExecuted" }
>;
type IntentCancelledLog = Extract<
  IntentFactoryLog,
  { eventName: "IntentCancelled" }
>;

const IntentStatus = {
  ACTIVE: "ACTIVE",
  EXECUTED: "EXECUTED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, IntentStatusValue>;

export const handleIntentCreated = async (log: IntentCreatedLog) => {
  const {
    intentId,
    user,
    tokenFrom,
    tokenTo,
    amount,
    priceThreshold,
    expiration,
  } = log.args;

  if (
    intentId === undefined ||
    user === undefined ||
    tokenFrom === undefined ||
    tokenTo === undefined ||
    amount === undefined ||
    priceThreshold === undefined ||
    expiration === undefined
  ) {
    return;
  }

  await db.insert(intent).values({
    id: intentId,
    user: normalizeAddress(user),
    tokenFrom: normalizeAddress(tokenFrom),
    tokenTo: normalizeAddress(tokenTo),
    amount: amount.toString(),
    priceThreshold: priceThreshold.toString(),
    expiration,
    status: IntentStatus.ACTIVE,
    createdTxHash: log.transactionHash,
    createdBlock: log.blockNumber,
  });
};

export const handleIntentUpdated = async (log: IntentUpdatedLog) => {
  const { intentId, newPriceThreshold } = log.args;

  if (intentId === undefined || newPriceThreshold === undefined) {
    return;
  }

  await db
    .update(intent)
    .set({
      priceThreshold: newPriceThreshold.toString(),
      updatedBlock: log.blockNumber,
    })
    .where(eq(intent.id, intentId));
};

export const handleIntentExecuted = async (log: IntentExecutedLog) => {
  const { intentId } = log.args;

  if (intentId === undefined) {
    return;
  }

  await db
    .update(intent)
    .set({
      status: IntentStatus.EXECUTED,
      updatedBlock: log.blockNumber,
    })
    .where(eq(intent.id, intentId));
};

export const handleIntentCancelled = async (log: IntentCancelledLog) => {
  const { intentId } = log.args;

  if (intentId === undefined) {
    return;
  }

  await db
    .update(intent)
    .set({
      status: IntentStatus.CANCELLED,
      updatedBlock: log.blockNumber,
    })
    .where(eq(intent.id, intentId));
};
