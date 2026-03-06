import type { Address } from "viem";
import type { TokenInfo, TokenSymbol } from "../types";
import { normalizeAddress } from "../utils";
import { LINK_TOKEN_ADDRESS, WRAPPED_ETH_TOKEN_ADDRESS } from "./addresses";

export const bySymbol = {
  WETH: { symbol: "WETH", address: WRAPPED_ETH_TOKEN_ADDRESS },
  LINK: { symbol: "LINK", address: LINK_TOKEN_ADDRESS },
} as const satisfies Record<TokenSymbol, TokenInfo>;

export const byAddress = Object.fromEntries(
  (Object.values(bySymbol) as TokenInfo[]).map((t) => [
    normalizeAddress(t.address),
    t,
  ])
) as Record<Lowercase<Address>, TokenInfo>;
