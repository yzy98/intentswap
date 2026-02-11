import type { Address } from "viem";

export const LINK_TOKEN_ADDRESS = process.env
  .NEXT_PUBLIC_LINK_TOKEN_ADDRESS as Address;
export const WRAPPED_ETH_TOKEN_ADDRESS = process.env
  .NEXT_PUBLIC_WRAPPED_ETH_TOKEN_ADDRESS as Address;

export const PRICE_FEED_CONTRACT_LINK_TO_ETH_ADDRESS = process.env
  .NEXT_PUBLIC_PRICE_FEED_CONTRACT_LINK_TO_ETH_ADDRESS as Address;
