import { intentExecutorAbi } from "@/abis/intentExecutor";
import { intentFactoryAbi } from "@/abis/intentFactory";
import { oracleAbi } from "@/abis/oracle";
import { swapperAbi } from "@/abis/swapper";
import {
  SEPOLIA_CONTRACT_INTENT_EXECUTOR_ADDRESS,
  SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS,
  SEPOLIA_CONTRACT_ORACLE_ADDRESS,
  SEPOLIA_CONTRACT_SWAPPER_ADDRESS,
} from "./addresses";

// Sepolia 11155111

export const oracleContractSepolia = {
  address: SEPOLIA_CONTRACT_ORACLE_ADDRESS,
  abi: oracleAbi,
} as const;

export const swapperContractSepolia = {
  address: SEPOLIA_CONTRACT_SWAPPER_ADDRESS,
  abi: swapperAbi,
} as const;

export const intentFactoryContractSepolia = {
  address: SEPOLIA_CONTRACT_INTENT_FACTORY_ADDRESS,
  abi: intentFactoryAbi,
} as const;

export const intentExecutorContractSepolia = {
  address: SEPOLIA_CONTRACT_INTENT_EXECUTOR_ADDRESS,
  abi: intentExecutorAbi,
} as const;
