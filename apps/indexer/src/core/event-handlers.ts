import { IntentStatus } from "@packages/db";
import type { ParseEventLogsReturnType } from "viem";
import type { intentFactoryAbi } from "@/abis/intent-factory";
import { dbClient } from "@/clients/db-client";

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

  await dbClient.intent.create({
    data: {
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
    },
  });
};

export const handleIntentUpdated = async (log: IntentUpdatedLog) => {
  const { intentId, newPriceThreshold } = log.args;

  if (intentId === undefined || newPriceThreshold === undefined) {
    return;
  }

  await dbClient.intent.update({
    where: {
      id: intentId,
    },
    data: {
      priceThreshold: newPriceThreshold.toString(),
      updatedBlock: log.blockNumber,
    },
  });
};

export const handleIntentExecuted = async (log: IntentExecutedLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined || user === undefined) {
    return;
  }

  await dbClient.intent.update({
    where: {
      id: intentId,
    },
    data: {
      status: IntentStatus.EXECUTED,
      updatedBlock: log.blockNumber,
    },
  });
};

export const handleIntentCancelled = async (log: IntentCancelledLog) => {
  const { intentId, user } = log.args;

  if (intentId === undefined || user === undefined) {
    return;
  }

  await dbClient.intent.update({
    where: {
      id: intentId,
    },
    data: {
      status: IntentStatus.CANCELLED,
      updatedBlock: log.blockNumber,
    },
  });
};
