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

export const handleIntentCreated = (log: IntentCreatedLog) => {
  const { intentId, user } = log.args;
  // [TODO] Insert intent into database
  console.log(`Intent created: ${intentId} by ${user}`);
};

export const handleIntentUpdated = async (log: IntentUpdatedLog) => {
  const { intentId, newPriceThreshold } = log.args;

  if (!(intentId && newPriceThreshold)) {
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

  if (!(intentId && user)) {
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

  if (!(intentId && user)) {
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
