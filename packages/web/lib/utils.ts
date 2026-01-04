import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { byAddress, bySymbol } from "./token-map";
import type {
  Address,
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
