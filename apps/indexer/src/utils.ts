import type { Address } from "viem";

export function normalizeAddress(addr: Address) {
  return addr.toLowerCase() as Lowercase<Address>;
}
