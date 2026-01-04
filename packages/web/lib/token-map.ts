import {
  SEPOLIA_BTC_TOKEN_ADDRESS,
  SEPOLIA_ETH_TOKEN_ADDRESS,
  SEPOLIA_LINK_TOKEN_ADDRESS,
} from "./addresses";
import type { Address, TokenInfo, TokenSymbol } from "./types";
import { normalizeAddress } from "./utils";

export const bySymbol = {
  BTC: { symbol: "BTC", address: SEPOLIA_BTC_TOKEN_ADDRESS },
  ETH: { symbol: "ETH", address: SEPOLIA_ETH_TOKEN_ADDRESS },
  LINK: { symbol: "LINK", address: SEPOLIA_LINK_TOKEN_ADDRESS },
} as const satisfies Record<TokenSymbol, TokenInfo>;

export const byAddress = Object.fromEntries(
  (Object.values(bySymbol) as TokenInfo[]).map((t) => [
    normalizeAddress(t.address),
    t,
  ])
) as Record<Lowercase<Address>, TokenInfo>;
