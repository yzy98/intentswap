// GENERATED FILE. DO NOT EDIT.

import type { Address } from "viem";

export const deployments = {
  84532: {
    chainId: 84532,
    networkName: "baseSepolia",
    contracts: {
      oracle: "0x31b3060bbfbeaffa7fed8351fb39ca02ca95bd82" as Address,
      swapper: "0x4233319d13eca85cad7301a75f604477d684bb4d" as Address,
      intentFactory: "0x57ea2cb2c6581f209f9484c8d522abb7590e9f77" as Address,
      intentExecutor: "0xd234a5e6bb1428ddc0a8f21f39d6518af669d19f" as Address,
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
