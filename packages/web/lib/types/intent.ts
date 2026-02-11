import type { intentFactoryAbi } from "@packages/contract-deployments";
import type { Address, ReadContractReturnType } from "viem";

const intentStatusMap = {
  0: "Active",
  1: "Executed",
  2: "Cancelled",
} as const satisfies Record<number, string>;

export type IntentStatusNumber = keyof typeof intentStatusMap;

export type IntentStatusString = (typeof intentStatusMap)[IntentStatusNumber];

export type IntentIds =
  | ReadContractReturnType<
      typeof intentFactoryAbi,
      "getUserIntentIds",
      readonly [Address]
    >
  | undefined;

export type Intent = ReadContractReturnType<
  typeof intentFactoryAbi,
  "getIntent",
  readonly [bigint]
>;

export interface IntentRow {
  intentId: bigint;
  intent: Intent;
  isActive: boolean;
  isExpired: boolean;
  hasBalance: boolean;
  hasAllowance: boolean;
  canExecute: boolean;
  executionBlockReason?: string;
  botSubscribed: boolean;
}
