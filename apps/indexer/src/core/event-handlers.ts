import type { IntentStatusValue } from "@packages/db";
import { intent } from "@packages/db/schema";
import { and, eq } from "drizzle-orm";
import type { ParseEventLogsReturnType } from "viem";
import type { intentFactoryAbi } from "@/abis/intent-factory";
import { db } from "@/clients/db-client";

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
  console.log("--handleIntentCreated", log);
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
    user,
    tokenFrom,
    tokenTo,
    amount: amount.toString(),
    priceThreshold: priceThreshold.toString(),
    expiration,
    status: IntentStatus.ACTIVE,
    createdTxHash: log.transactionHash,
    createdBlock: log.blockNumber,
  });
};

export const handleIntentUpdated = async (log: IntentUpdatedLog) => {
  const { intentId, user, newPriceThreshold } = log.args;

  if (
    intentId === undefined ||
    user === undefined ||
    newPriceThreshold === undefined
  ) {
    return;
  }

  await db
    .update(intent)
    .set({
      priceThreshold: newPriceThreshold.toString(),
      updatedBlock: log.blockNumber,
    })
    .where(and(eq(intent.id, intentId), eq(intent.user, user)));
};

export const handleIntentExecuted = async (log: IntentExecutedLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined || user === undefined) {
    return;
  }

  await db
    .update(intent)
    .set({
      status: IntentStatus.EXECUTED,
      updatedBlock: log.blockNumber,
    })
    .where(and(eq(intent.id, intentId), eq(intent.user, user)));
};

export const handleIntentCancelled = async (log: IntentCancelledLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined || user === undefined) {
    return;
  }

  await db
    .update(intent)
    .set({
      status: IntentStatus.CANCELLED,
      updatedBlock: log.blockNumber,
    })
    .where(and(eq(intent.id, intentId), eq(intent.user, user)));
};
