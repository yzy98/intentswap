// GENERATED FILE. DO NOT EDIT.

import type { Address } from "viem";

export const deployments = {
  84532: {
    chainId: 84532,
    networkName: "baseSepolia",
    contracts: {
      oracle: "0x59c34b3ddac716163569bc2260597915b87d3746" as Address,
      swapper: "0xae56c8a727e4228b3e158a6f6ac3e17e01612c32" as Address,
      intentFactory: "0x2baebd24fcb1df7693def8a649125fd4736eaae2" as Address,
      intentExecutor: "0xe7966aaa7182b81bcfcb3c7cea9fbf9fadd17e90" as Address,
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
