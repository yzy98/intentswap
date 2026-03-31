import {
  getDeployment,
  intentExecutorAbi,
  intentFactoryAbi,
  oracleAbi,
  swapperAbi,
} from "@packages/contract-deployments";

const d = getDeployment(Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111"));

export const oracleContract = {
  address: d.contracts.oracle,
  abi: oracleAbi,
} as const;

export const swapperContract = {
  address: d.contracts.swapper,
  abi: swapperAbi,
} as const;

export const intentFactoryContract = {
  address: d.contracts.intentFactory,
  abi: intentFactoryAbi,
} as const;

export const intentExecutorContract = {
  address: d.contracts.intentExecutor,
  abi: intentExecutorAbi,
} as const;
