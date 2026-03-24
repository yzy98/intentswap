import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Address } from "viem";
import { byAddress, bySymbol } from "./constants";
import type {
  IntentStatusNumber,
  IntentStatusString,
  TokenInfo,
  TokenSymbol,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAddress(addr: Address) {
  return addr.toLowerCase() as Lowercase<Address>;
}

export function getTokenBySymbol(symbol: TokenSymbol): TokenInfo {
  return bySymbol[symbol];
}

export function getTokenByAddress(address: Address): TokenInfo | undefined {
  return byAddress[normalizeAddress(address)];
}

export function getIntentStatusFromEnum(
  num: IntentStatusNumber
): IntentStatusString {
  if (num === 0) {
    return "Active";
  }
  if (num === 1) {
    return "Executed";
  }
  return "Cancelled";
}

export function getIntentStatusEnumFromString(
  text: IntentStatusString
): IntentStatusNumber {
  if (text === "Active") {
    return 0;
  }
  if (text === "Executed") {
    return 1;
  }
  return 2;
}

export const getReadContractsResult = <T>(
  entry: { status: "success"; result: T } | { status: "failure" } | undefined
): T | undefined => (entry?.status === "success" ? entry.result : undefined);

export const getExecutionBlockReason = (
  isActive: boolean,
  isExpired: boolean,
  hasBalance: boolean,
  hasAllowance: boolean,
  balanceStatus?: "success" | "failure",
  allowanceStatus?: "success" | "failure"
) => {
  if (!isActive || isExpired) {
    return undefined;
  }
  if (balanceStatus === "failure" || allowanceStatus === "failure") {
    return "Unknown";
  }
  if (!hasBalance) {
    return "Insufficient balance";
  }
  if (!hasAllowance) {
    return "Not approved";
  }
  return undefined;
};

export function shortAddress(
  address?: string,
  opts: { start?: number; end?: number } = {}
) {
  if (!address) {
    return "";
  }
  const { start = 4, end = 4 } = opts;
  if (address.length <= 2 + start + end) {
    return address;
  } // too short to shorten
  return `${address.slice(0, 2 + start)}…${address.slice(-end)}`;
}

export async function pollUntil<T>({
  fn,
  validate,
  interval = 1500,
  timeout = 30_000,
}: {
  fn: () => Promise<T>;
  validate: (value: T) => boolean;
  interval?: number;
  timeout?: number;
}): Promise<T> {
  const start = Date.now();

  while (true) {
    const result = await fn();

    if (validate(result)) {
      return result;
    }

    if (Date.now() - start >= timeout) {
      throw new Error("Timeout while polling");
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
