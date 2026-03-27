// GENERATED FILE. DO NOT EDIT.

import type { Address } from "viem";

export const deployments = {
  11155111: {
    chainId: 11155111,
    networkName: "sepolia",
    contracts: {
      oracle: "0xb8ba56bcccdf3636afbb0cd59009e58a079f2daf" as Address,
      swapper: "0x681e2f193ed4d58fcb79c2e39f7e018137485591" as Address,
      intentFactory: "0x14e050cac3dfebc5dbe456115dc7cd3d69731971" as Address,
      intentExecutor: "0x524f5793de2075f3dfd282161a29738d0f953718" as Address,
    },
  }
} as const;

export type SupportedChainId = keyof typeof deployments;
export type Deployment = (typeof deployments)[SupportedChainId];

export function getDeployment(chainId: number): Deployment {
  const d = (deployments as Record<number, Deployment>)[chainId];
  if (!d) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return d;
}
