import type { ReadContractReturnType } from "viem";
import type { intentFactoryContractSepolia } from "@/lib/constants";

const intentStatusMap = {
  0: "Active",
  1: "Executed",
  2: "Cancelled",
} as const satisfies Record<number, string>;

export type IntentStatusNumber = keyof typeof intentStatusMap;

export type IntentStatusString = (typeof intentStatusMap)[IntentStatusNumber];

export type Intent = ReadContractReturnType<
  typeof intentFactoryContractSepolia.abi,
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
