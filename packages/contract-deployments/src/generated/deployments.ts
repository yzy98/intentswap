// GENERATED FILE. DO NOT EDIT.

import type { Address } from "viem";

export const deployments = {
  11155111: {
    chainId: 11155111,
    networkName: "sepolia",
    contracts: {
      oracle: "0xc520df059b8cd6b00982683ae897906842d3c50b" as Address,
      swapper: "0x7affc4e65752892afc92d43ff881fe2df44cd193" as Address,
      intentFactory: "0x3311084920adb5ed685fc89afbfb27279dc05642" as Address,
      intentExecutor: "0x358eb6207dbef61bbb59a3c78677634ee15c4afe" as Address,
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
