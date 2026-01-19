export type Address = `0x${string}`;

export type TokenSymbol = "BTC" | "ETH" | "LINK" | "WETH";

export interface TokenInfo {
  symbol: TokenSymbol;
  address: Address;
}

const intentStatusMap = {
  0: "Active",
  1: "Executed",
  2: "Cancelled",
} as const satisfies Record<number, string>;

export type IntentStatusNumber = keyof typeof intentStatusMap;
export type IntentStatusString = (typeof intentStatusMap)[IntentStatusNumber];
