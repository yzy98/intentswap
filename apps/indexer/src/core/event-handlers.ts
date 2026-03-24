import type { intentFactoryAbi } from "@packages/contract-deployments";
import { eq } from "@packages/db/helper";
import type {
  IntentEventTypeValue,
  IntentStatusValue,
} from "@packages/db/schema";
import { intent, intentEvent } from "@packages/db/schema";
import type { ParseEventLogsReturnType } from "viem";
import { db } from "@/clients/db-client";
import { ENV } from "@/env";
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

const IntentEventType = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  EXECUTED: "EXECUTED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, IntentEventTypeValue>;

const persistIntentEvent = async ({
  dbExecutor = db,
  log,
  intentId,
  eventType,
  actor,
  payload,
}: {
  dbExecutor?: Pick<typeof db, "insert">;
  log: IntentFactoryLog;
  intentId: bigint;
  eventType: IntentEventTypeValue;
  actor?: `0x${string}`;
  payload?: Record<string, unknown>;
}) => {
  if (log.transactionHash === null || log.logIndex === null) {
    return;
  }

  await dbExecutor
    .insert(intentEvent)
    .values({
      chainId: ENV.CHAIN_ID,
      intentId,
      eventType,
      txHash: log.transactionHash.toLowerCase(),
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      actor: actor ? normalizeAddress(actor) : null,
      payload: payload ?? null,
    })
    .onConflictDoNothing({
      target: [intentEvent.chainId, intentEvent.txHash, intentEvent.logIndex],
    });
};

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

  await db.transaction(async (tx) => {
    await tx
      .insert(intent)
      .values({
        id: intentId,
        user: normalizeAddress(user),
        tokenFrom: normalizeAddress(tokenFrom),
        tokenTo: normalizeAddress(tokenTo),
        amount: amount.toString(),
        priceThreshold: priceThreshold.toString(),
        expiration,
        status: IntentStatus.ACTIVE,
        createdTxHash: log.transactionHash.toLowerCase(),
        createdBlock: log.blockNumber,
      })
      .onConflictDoNothing({
        target: [intent.id],
      });

    await persistIntentEvent({
      dbExecutor: tx,
      log,
      intentId,
      eventType: IntentEventType.CREATED,
      actor: user,
      payload: {
        tokenFrom: normalizeAddress(tokenFrom),
        tokenTo: normalizeAddress(tokenTo),
        amount: amount.toString(),
        priceThreshold: priceThreshold.toString(),
        expiration: expiration.toString(),
      },
    });
  });
};

export const handleIntentUpdated = async (log: IntentUpdatedLog) => {
  const { intentId, user, oldPriceThreshold, newPriceThreshold } = log.args;

  if (intentId === undefined || newPriceThreshold === undefined) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(intent)
      .set({
        priceThreshold: newPriceThreshold.toString(),
        updatedBlock: log.blockNumber,
      })
      .where(eq(intent.id, intentId));

    await persistIntentEvent({
      dbExecutor: tx,
      log,
      intentId,
      eventType: IntentEventType.UPDATED,
      actor: user,
      payload: {
        oldPriceThreshold: oldPriceThreshold?.toString(),
        newPriceThreshold: newPriceThreshold.toString(),
      },
    });
  });
};

export const handleIntentExecuted = async (log: IntentExecutedLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(intent)
      .set({
        status: IntentStatus.EXECUTED,
        updatedBlock: log.blockNumber,
      })
      .where(eq(intent.id, intentId));

    await persistIntentEvent({
      dbExecutor: tx,
      log,
      intentId,
      eventType: IntentEventType.EXECUTED,
      actor: user,
    });
  });
};

export const handleIntentCancelled = async (log: IntentCancelledLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(intent)
      .set({
        status: IntentStatus.CANCELLED,
        updatedBlock: log.blockNumber,
      })
      .where(eq(intent.id, intentId));

    await persistIntentEvent({
      dbExecutor: tx,
      log,
      intentId,
      eventType: IntentEventType.CANCELLED,
      actor: user,
    });
  });
};
