import type { Address } from "viem";

export type TokenSymbol = "LINK" | "WETH";

export interface TokenInfo {
  symbol: TokenSymbol;
  address: Address;
}
