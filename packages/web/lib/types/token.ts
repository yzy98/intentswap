import type { Address } from "viem";

export type TokenSymbol = "BTC" | "LINK" | "WETH";

export interface TokenInfo {
  symbol: TokenSymbol;
  address: Address;
}
